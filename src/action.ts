"use server"
import { auth } from "@/auth";
import { uniq } from "lodash";
import { prisma } from "@/db";
import { revalidatePath } from "next/cache";
import { pusherServer } from "../lib/pusher/server";

export async function getSessionEmail(): Promise<string | null | undefined> {
  const session = await auth();
  return session?.user?.email;
}

export async function getSessionEmailOrThrow(): Promise<string> {
  const userEmail = await getSessionEmail();
  if (!userEmail) {
    throw new Error("Not logged in");
  }
  return userEmail;
}
export async function updateProfile(data: FormData) {
  const userEmail = await getSessionEmailOrThrow();

  const newUserInfo = {
    username: data.get('username') as string,
    name: data.get('name') as string,
    subtitle: data.get('subtitle') as string,
    bio: data.get('bio') as string,
    avatar: data.get('avatar') as string,
  };

  await prisma.profile.upsert({
    where: { email: userEmail }, // Find the user by email
    update: newUserInfo, // Update existing profile
    create: {
      email: userEmail,
      ...newUserInfo,
    }, // Create profile if it doesn’t exist
  });
}

export async function postEntry(data: FormData) {
  const sessionEmail = await getSessionEmailOrThrow();

  const mediaData = data.get('media');
  const description = data.get('description');

  if (!mediaData || typeof mediaData !== 'string') {
    throw new Error("Media is required and must be a string");
  }
  if (typeof description !== 'string') {
    throw new Error("Description must be a string");
  }

  const mediaArray: { url: string; type: 'image' | 'video' }[] = JSON.parse(mediaData);

  const postDoc = await prisma.post.create({
    data: {
      author: sessionEmail,
      description,
      media: {
        create: mediaArray.map((m) => ({
          url: m.url,
          type: m.type,
        })),
      },
    },
  });

  return postDoc.id;
}
export async function postComment(data: FormData) {
  const postId = data.get("postId")?.toString();
  const text = data.get("text")?.toString();

  if (!postId || !text) throw new Error("Missing postId or text");

  const authorEmail = await getSessionEmailOrThrow();

  const [sender, post] = await Promise.all([
    prisma.profile.findUnique({
      where: { email: authorEmail },
      select: { id: true, username: true, avatar: true },
    }),
    prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, author: true },
    }),
  ]);

  if (!sender || !post) throw new Error("Invalid post or sender");

  const comment = await prisma.comment.create({
    data: { author: authorEmail, postId, text },
  });

  if (post.author !== authorEmail) {
    const receiver = await prisma.profile.findUnique({
      where: { email: post.author },
      select: { id: true },
    });

    if (receiver) {
      const notification = await prisma.notification.create({
        data: {
          type: "comment",
          senderId: sender.id,
          receiverId: receiver.id,
          postId: post.id,
          message: `${sender.username} commented on your post.`,
          isRead: false, // ✅ ensure unread status
        },
      });

      // Push real-time notification
      await pusherServer.trigger(`user-${receiver.id}`, "new-notification", {
        id: notification.id,
        message: notification.message,
        type: "comment",
        postId: post.id,
        senderId: sender.id,
        senderUsername: sender.username,
        senderAvatar: sender.avatar,
        createdAt: notification.createdAt.toISOString(),
        ourFollow: null, // Let client re-check if needed
      });
    }
  }

  return comment;
}

export async function deleteComment(commentId: string) {
  const authorEmail = await getSessionEmailOrThrow();

  // Ensure the comment belongs to the logged-in user before deleting
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!comment || comment.author !== authorEmail) {
    throw new Error("Unauthorized or comment not found");
  }

  await prisma.comment.delete({
    where: { id: commentId },
  });
}

export const updateComment = async (commentId: string, newText: string) => {
  const authorEmail = await getSessionEmailOrThrow();

  // Find the comment to verify ownership
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!comment || comment.author !== authorEmail) {
    throw new Error("Unauthorized or comment not found");
  }

  try {
    await prisma.comment.update({
      where: { id: commentId },
      data: { text: newText },
    });
  } catch (error) {
    console.error("Failed to update comment:", error);
    throw new Error("Failed to update comment.");
  }
};
export async function updatePostLikesCount(postId: string) {
  await prisma.post.update({
    where: { id: postId },
    data: {
      likesCount: await prisma.like.count({
        where: { postId },
      })
    },
  });
}
// export async function likePost(data: FormData) {
//   const postId = data.get('postId') as string;
//   await prisma.like.create({
//     data: {
//       author: await getSessionEmailOrThrow(),
//       postId,
//     }
//   })
//   await updatePostLikesCount(postId)
// }

export async function likePost(data: FormData) {
  const postId = data.get("postId")?.toString();
  if (!postId) throw new Error("Missing postId");

  const senderEmail = await getSessionEmailOrThrow();

  const [senderProfile, post] = await Promise.all([
    prisma.profile.findUnique({ where: { email: senderEmail } }),
    prisma.post.findUnique({ where: { id: postId } }),
  ]);

  if (!post || !senderProfile) throw new Error("Invalid post or profile");

  // Create the like
  await prisma.like.create({
    data: {
      author: senderEmail,
      postId,
    },
  });

  // Don’t notify yourself
  if (post.author !== senderEmail) {
    const receiver = await prisma.profile.findUnique({
      where: { email: post.author },
    });

    if (receiver) {
      const notification = await prisma.notification.create({
        data: {
          type: "like",
          senderId: senderProfile.id,
          receiverId: receiver.id,
          postId: post.id,
          message: `${senderProfile.username} liked your post.`,
        },
      });

      // 🔔 Send real-time notification via Pusher
      await pusherServer.trigger(`user-${receiver.id}`, "new-notification", {
        type: "like",
        message: notification.message,
        sender: {
          id: senderProfile.id,
          username: senderProfile.username,
          avatar: senderProfile.avatar,
        },
        postId: post.id,
        notificationId: notification.id,
        createdAt: notification.createdAt,
      });
    }
  }

  await updatePostLikesCount(postId);
}



export async function removeLikeFromPost(data: FormData) {
  const postId = data.get('postId') as string;
  await prisma.like.deleteMany({
    where: {
      author: await getSessionEmailOrThrow(),
      postId,
    }
  })
  await updatePostLikesCount(postId)
}


export async function followProfile(profileIdToFollow: string) {
  const senderEmail = await getSessionEmailOrThrow();

  const sender = await prisma.profile.findFirstOrThrow({
    where: { email: senderEmail },
  });

  if (sender.id === profileIdToFollow) return; // cannot follow self

  // Prevent duplicate follows
  const alreadyFollowing = await prisma.follower.findFirst({
    where: {
      followingProfileId: sender.id,
      followedProfileId: profileIdToFollow,
    },
  });

  if (alreadyFollowing) return;

  await prisma.follower.create({
    data: {
      followingProfileEmail: sender.email,
      followingProfileId: sender.id,
      followedProfileId: profileIdToFollow,
    },
  });

  const receiver = await prisma.profile.findUnique({
    where: { id: profileIdToFollow },
  });

  if (receiver) {
    const notification = await prisma.notification.create({
      data: {
        type: "follow",
        senderId: sender.id,
        receiverId: receiver.id,
        message: `${sender.username} started following you.`,
      },
    });

    await pusherServer.trigger(`user-${receiver.id}`, "new-notification", {
      type: "follow",
      message: notification.message,
      sender: {
        id: sender.id,
        username: sender.username,
        avatar: sender.avatar,
      },
      notificationId: notification.id,
      createdAt: notification.createdAt,
    });
  }
}



export async function unfollowProfile(profileIdToUnfollow: string) {
  const sessionProfile = await prisma.profile.findFirstOrThrow({
    where: { email: await getSessionEmailOrThrow() },
  });

  await prisma.follower.deleteMany({
    where: {
      followingProfileEmail: sessionProfile.email,
      followingProfileId: sessionProfile.id,
      followedProfileId: profileIdToUnfollow,
    },
  });
}
export async function removeFollowerById(followerId: string) {
  const sessionEmail = await getSessionEmailOrThrow();

  const currentProfile = await prisma.profile.findUnique({
    where: { email: sessionEmail },
  });

  if (!currentProfile) throw new Error("Profile not found");

  const followerRecord = await prisma.follower.findUnique({
    where: { id: followerId },
  });

  if (followerRecord?.followedProfileId !== currentProfile.id) {
    throw new Error("Not authorized to remove this follower");
  }

  await prisma.follower.delete({ where: { id: followerId } });
  revalidatePath("/");
}

export async function bookmarkPost(postId: string) {
  const sessionEmail = await getSessionEmailOrThrow();
  await prisma.bookmark.create({
    data: {
      author: sessionEmail,
      postId,
    }
  })
}

export async function unbookmarkPost(postId: string) {
  const sessionEmail = await getSessionEmailOrThrow();
  await prisma.bookmark.deleteMany({
    where: {
      author: sessionEmail,
      postId,
    }
  })
}

export async function getSinglePostData(postId: string) {
  const sessionEmail = await getSessionEmailOrThrow();
  const currectUser = await prisma.profile.findFirst({
    where: { email: sessionEmail }
  });

  const post = await prisma.post.findFirstOrThrow({
    where: {
      id: postId
    },
    include: {
      media: true,
    },
  })
  const authorProfile = await prisma.profile.findFirstOrThrow({
    where: {
      email: post.author
    }

  })
  const myLike = await prisma.like.findFirst({
    where: {
      author: sessionEmail,
      postId: post.id,
    },
  })
  const comments = await prisma.comment.findMany({
    where: { postId: post.id },
  });
  const commentsAuthors = await prisma.profile.findMany({
    where: {
      email: { in: uniq(comments.map((c) => c.author)) },
    }
  })
  const myBookmark = await prisma.bookmark.findFirst({
    where: {
      author: sessionEmail,
      postId: post.id,
    }
  });
  return {
    post, authorProfile, comments,
    commentsAuthors, myLike, myBookmark, currectUser
  };
};



export async function deletePost(postId: string) {
  const sessionEmail = await getSessionEmailOrThrow();

  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    throw new Error('Post not found');
  }

  if (post.author !== sessionEmail) {
    throw new Error('Unauthorized: You can only delete your own posts');
  }

  // Delete related Media, Likes, and Comments first
  await prisma.media.deleteMany({
    where: { postId: postId },
  });

  await prisma.like.deleteMany({
    where: { postId: postId },
  });

  await prisma.comment.deleteMany({
    where: { postId: postId },
  });

  // Finally delete the Post
  await prisma.post.delete({
    where: { id: postId },
  });
}

// export async function sendMessage(receiverId: string, text: string) {
//   const sender = await prisma.profile.findFirstOrThrow({
//     where: { email: await getSessionEmailOrThrow() },
//   });

//   const message = await prisma.message.create({
//     data: {
//       text,
//       senderId: sender.id,
//       receiverId,
//     },
//   });

//   const messagePayload = {
//     id: message.id,
//     senderId: sender.id,
//     receiverId,
//     text,
//     createdAt: message.createdAt,
//     senderUsername: sender.username,
//     senderAvatar: sender.avatar,
//   };

//   // 🔔 Send to the RECEIVER
//   await pusherServer.trigger(`chat-${receiverId}`, "new-message", messagePayload);

//   // 🔁 ALSO send to the SENDER (yourself)
//   await pusherServer.trigger(`chat-${sender.id}`, "new-message", messagePayload);

//   return message;
// }

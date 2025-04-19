"use server"
import { auth } from "@/auth";
import { uniq } from "lodash";
import { prisma } from "@/db";
import { revalidatePath } from "next/cache";

export async function getSessionEmail(): Promise<string | null | undefined> {
  const session = await auth();
  return session?.user?.email;
}

export async function getSessionEmailOrThrow(): Promise<string> {
  const userEmail = await getSessionEmail();
  if (!userEmail) {
    throw "not logged in";
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
  
export async function postEntry(data: FormData){
  const sessionEmail = await getSessionEmailOrThrow();
  const postDoc = await prisma.post.create({
    data: {
      author: sessionEmail,
      image: data.get('image') as string,
      description: data.get('description') as string,

    }
  })
  return postDoc.id;
}
export async function postComment(data: FormData) {
  const authorEmail = await getSessionEmailOrThrow(); // Get email of the logged-in user

  return prisma.comment.create({
    data: {
      author: authorEmail, // Store email instead of ObjectId
      postId: data.get('postId') as string,
      text: data.get('text') as string,
    },
  });
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
export async  function likePost (data: FormData){
  const postId = data.get('postId') as string;
    await prisma.like.create({
    data: {
      author: await getSessionEmailOrThrow(),
      postId,
    }
  })
  await updatePostLikesCount(postId)
}

export async function removeLikeFromPost(data:FormData){
  const postId = data.get('postId') as string;
  await prisma.like.deleteMany({
    where: {
      author: await getSessionEmailOrThrow(),
      postId,
    }
  })
  await updatePostLikesCount(postId)
}

export async function followProfile(profileIdToFollow:string) {
  const sessionProfile = await prisma.profile.findFirstOrThrow({
    where:{email: await getSessionEmailOrThrow()},
  });
  await prisma.follower.create({
    data: {
      followingProfileEmail: sessionProfile.email,
      followingProfileId: sessionProfile.id,
      followedProfileId: profileIdToFollow,
    }
  })
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

  // Revalidate the current page
  revalidatePath("/"); // 👈 update this path to your current page route
}

export async function bookmarkPost(postId: string){
  const sessionEmail = await getSessionEmailOrThrow();
  await prisma.bookmark.create({
    data: {
      author: sessionEmail,
      postId,
    }
  })
}

export async function unbookmarkPost(postId: string){
  const sessionEmail = await getSessionEmailOrThrow();
  await prisma.bookmark.deleteMany({
    where: {
      author: sessionEmail,
      postId,
    }
  })
}

export async function getSinglePostData(postId:string){
  const sessionEmail = await getSessionEmailOrThrow();
  const post = await prisma.post.findFirstOrThrow({
    where: {
      id: postId
    }
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
    where:{
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
    commentsAuthors, myLike, myBookmark,
  };
};
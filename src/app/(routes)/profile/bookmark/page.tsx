import ProfileNav from "@/Components/ProfileNav";
import ProfilePageInfo from "@/Components/ProfilePageInfo";
import {auth} from "@/auth";
import {prisma} from "@/db";
import {redirect} from "next/navigation";
import PostGrid from "@/Components/PostsGrid";
export default async function BookMarkPage(){
  
    const session = await auth();
    const profile = await prisma.profile
      .findFirst({where:{email:session?.user?.email as string}});
    if (!profile) {
      return redirect('/settings');
    }
    const bookmarks = await prisma.bookmark.findMany({
      where: {author:session?.user?.email as string},
    });
    const posts = await prisma.post.findMany({
      where: {id: {in: bookmarks.map(b => b.postId)}},
    })

    const [postCount, followersCount, followingCount] = await Promise.all([
      prisma.post.count({
        where: { author: profile.email }, 
      }),
      prisma.follower.count({
        where: { followedProfileId: profile.id },
      }),
      prisma.follower.count({
        where: { followingProfileId: profile.id }, 
      }),
    ]);

    return (
        <div>
          <ProfilePageInfo
            profile={profile}
            isOurProfile={true}
            ourFollow={null} 
            stats={{ postCount, followersCount, followingCount }}
            />
          <ProfileNav
            username={profile.username || ''}
            isOurProfile={true} />
          <div className="mt-4">
            <PostGrid posts={posts} />
          </div>
        </div>
      );
    }
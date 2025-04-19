import PostGrid from "@/Components/PostsGrid";
import { prisma } from "@/db"

export default async function ExplorePage(){
  const posts = await prisma.post.findMany({
    include: {
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
  });
  
    return (
        <div>
         <PostGrid posts={posts}/>
        </div>
    )
};
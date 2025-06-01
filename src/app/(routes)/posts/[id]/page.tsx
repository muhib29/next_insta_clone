import { getSinglePostData } from "@/action";
import SinglePostContent from "@/Components/SinglePostContent";

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  // Await params because it's a Promise now
  const { id } = await params;

  const { post, authorProfile, myLike, comments, commentsAuthors, myBookmark } = await getSinglePostData(id);

  return (
    <div>
      <SinglePostContent
        post={post}
        authorProfile={authorProfile}
        myLike={myLike}
        comments={comments}
        commentsAuthors={commentsAuthors}
        myBookmark={myBookmark}
      />
    </div>
  );
}

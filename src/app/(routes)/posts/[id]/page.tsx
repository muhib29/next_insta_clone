
import { getSinglePostData} from "@/action"
import SinglePostContent from "@/Components/SinglePostContent";

export default async function PostPage({params}:{params:{id:string}}) {
 
    const {post, authorProfile, myLike , comments, commentsAuthors, myBookmark} = await getSinglePostData(params.id);
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
    )
}
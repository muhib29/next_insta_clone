'use client';

import useSWR from 'swr';
import Preloader from './Preloader';
import { getSinglePostData } from '@/action';
import SinglePostContent from './SinglePostContent';

const fetcher = async (postId: string) => {
  return await getSinglePostData(postId);
};

export default function PostClientContent({ postId }: { postId: string }) {
  const { data, error, isLoading, mutate } = useSWR(postId, fetcher);

  if (isLoading || !data) return <Preloader />;
  if (error) return <div>Failed to load post</div>;

  const { post, authorProfile, myLike, comments, commentsAuthors, myBookmark, currectUser } = data;

  return (
    <SinglePostContent
      post={post}
      authorProfile={authorProfile}
      myLike={myLike}
      comments={comments}
      commentsAuthors={commentsAuthors}
      myBookmark={myBookmark}
      currectUser={currectUser}
      mutate={mutate}
    />
  );
}

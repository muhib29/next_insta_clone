'use client';

// import { useEffect, useState } from 'react';
import useSWR from 'swr';
import SinglePostContent from './SinglePostContent';
import Preloader from './Preloader';
import { getSinglePostData } from '@/action'; // must work on client

const fetcher = async (postId: string) => {
  return await getSinglePostData(postId);
};

export default function ModalPostContent({ postId }: { postId: string }) {
  const { data, error, isLoading } = useSWR(postId, fetcher);

  if (isLoading || !data) return <Preloader />;
  if (error) return <div>Failed to load post</div>;

  const { post, authorProfile, myLike, comments, commentsAuthors, myBookmark } = data;

  return (
    <SinglePostContent
      post={post}
      authorProfile={authorProfile}
      myLike={myLike}
      comments={comments}
      commentsAuthors={commentsAuthors}
      myBookmark={myBookmark}
    />
  );
}

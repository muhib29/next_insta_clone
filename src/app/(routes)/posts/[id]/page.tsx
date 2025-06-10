import PostClientContent from "@/Components/PostClientContent";

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
  return <PostClientContent postId={id} />;
}
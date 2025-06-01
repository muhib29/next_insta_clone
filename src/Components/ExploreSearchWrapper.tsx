'use client';

import dynamic from 'next/dynamic';

const ExploreSearchBar = dynamic(() => import('./ExploreSearchBar'), {
  ssr: false,
});

export default function ExploreSearchWrapper() {
  return <ExploreSearchBar />;
}

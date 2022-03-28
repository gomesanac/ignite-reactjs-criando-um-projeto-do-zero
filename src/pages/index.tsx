import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';

import { useState } from 'react';

import { FiCalendar, FiUser } from 'react-icons/fi';

import Prismic from '@prismicio/client';

import { getPrismicClient } from '../services/prismic';

import formatResults from '../utils/formatResults';
import formatDate from '../utils/formatDate';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [results, setResults] = useState(postsPagination.results);
  const [nextPage, setNextPage] = useState(postsPagination.next_page || null);

  const getMoreResults = async () => {
    const newResults = (await fetch(nextPage, { method: 'GET' }).then(
      results => results.json()
    )) as PostPagination;

    const formattedNewResults = formatResults(newResults.results);

    setResults([...results, ...formattedNewResults]);
    setNextPage(newResults.next_page || null);
  };

  return (
    <>
      <Head>
        <title>spacetraveling</title>
      </Head>

      <main className={commonStyles.container}>
        <div className={`${commonStyles.content} ${styles.home}`}>
          {results.map(post => (
            <Link href={`/post/${post.uid}`} key={post.uid}>
              <a>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <div className={commonStyles.info}>
                  <div className={commonStyles.dateDiv}>
                    <FiCalendar />
                    <time>{formatDate(post.first_publication_date)}</time>
                  </div>
                  <div className={commonStyles.authorDiv}>
                    <FiUser />
                    <span>{post.data.author}</span>
                  </div>
                </div>
              </a>
            </Link>
          ))}
          {nextPage && (
            <button
              type="button"
              className={styles.button}
              onClick={getMoreResults}
            >
              Carregar mais posts
            </button>
          )}
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = (await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    { fetch: ['posts.title', 'posts.subtitle', 'posts.author'], pageSize: 4 }
  )) as PostPagination;

  const results = formatResults(postsResponse.results);

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results,
      },
    },
    revalidate: 60 * 60 * 24, // 24 horas
  };
};

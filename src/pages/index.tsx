import { GetStaticProps } from 'next';
import Head from 'next/head';

import { FiCalendar, FiUser } from 'react-icons/fi';

import Prismic from '@prismicio/client';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

import Link from 'next/link';
import { useState } from 'react';
import formatResults from '../utils/formatResults';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

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

  const formatDate = (date: string): string => {
    const formatedDate = format(new Date(date), 'PP', {
      locale: ptBR,
    });

    return formatedDate;
  };

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
                <div className={styles.info}>
                  <div className={styles.timeDiv}>
                    <FiCalendar />
                    <time>{formatDate(post.first_publication_date)}</time>
                  </div>
                  <div className={styles.authorDiv}>
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
  };
};

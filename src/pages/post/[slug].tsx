import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';

import { RichText } from 'prismic-dom';

import Prismic from '@prismicio/client';

import { getPrismicClient } from '../../services/prismic';

import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

import formatDate from '../../utils/formatDate';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { useRouter } from 'next/router';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();

  const getTotalTime = (): string => {
    const totalWords = post.data.content
      .reduce((acc, { body }) => {
        acc += RichText.asText(body);
        return acc;
      }, '')
      .split(' ').length;

    const totalTime = Math.ceil(totalWords / 200);

    return `${totalTime} min`;
  };

  if (router.isFallback) {
    return (
      <main className={commonStyles.container}>
        <article className={commonStyles.content}>
          <p>Carregando...</p>
        </article>
      </main>
    );
  }

  return (
    <>
      <Head>
        <title>spacetraveling</title>
      </Head>

      <figure className={styles.banner}>
        <img src={post.data.banner.url} alt={`banner-${post.data.title}`} />
      </figure>

      <main className={commonStyles.container}>
        <article className={`${commonStyles.content} ${styles.post}`}>
          <h1>{post.data.title}</h1>
          <div className={commonStyles.info}>
            <div className={commonStyles.dateDiv}>
              <FiCalendar />
              <time>{formatDate(post.first_publication_date)}</time>
            </div>
            <div className={commonStyles.authorDiv}>
              <FiUser />
              <span>{post.data.author}</span>
            </div>
            <div className={commonStyles.timeDiv}>
              <FiClock />
              <span>{getTotalTime()}</span>
            </div>
          </div>
          {post.data.content.map(({ heading, body }) => (
            <div key={heading}>
              <h2>{heading}</h2>
              <div
                className={styles.postContent}
                dangerouslySetInnerHTML={{
                  __html: RichText.asHtml(body),
                }}
              />
            </div>
          ))}
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();

  const { results } = await prismic.query([
    Prismic.predicates.at('document.type', 'posts'),
  ]);

  const posts = results.map(post => ({
    params: { slug: post.uid },
  }));

  return {
    paths: posts,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();

  const response = (await prismic.getByUID('posts', String(slug), {})) as Post;

  return {
    props: {
      post: response,
    },
  };
};

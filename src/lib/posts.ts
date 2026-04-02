import fs from 'fs';
import path from 'path';

type PostMeta = {
  title: string;
  date: string;
  summary: string;
  author: string;
  coverImage: string;
};

export type Post = PostMeta & {
  slug: string;
  content: string;
};

const postsDirectory = path.join(process.cwd(), 'content', 'posts');

function parseFrontMatter(fileContents: string): { data: PostMeta; content: string } {
  const match = fileContents.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);

  if (!match) {
    throw new Error('Invalid post format. Add frontmatter and content.');
  }

  const [, frontMatter, content] = match;

  const data = frontMatter.split('\n').reduce((acc: any, line) => {
    const [key, ...rest] = line.split(':');
    if (!key) return acc;
    acc[key.trim()] = rest.join(':').trim();
    return acc;
  }, {} as Record<string, string>);

  return {
    data: {
      title: data.title || '',
      date: data.date || '',
      summary: data.summary || '',
      author: data.author || '',
      coverImage: data.coverImage || '',
    },
    content: content.trim(),
  };
}

export function getPostSlugs(): string[] {
  if (!fs.existsSync(postsDirectory)) return [];

  return fs
    .readdirSync(postsDirectory)
    .filter((fileName: string) => fileName.endsWith('.md'))
    .map((fileName: string) => fileName.replace(/\.md$/, ''));
}

export function getPostBySlug(slug: string): Post {
  const realSlug = slug.replace(/\.md$/, '');
  const fullPath = path.join(postsDirectory, `${realSlug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = parseFrontMatter(fileContents);

  return {
    slug: realSlug,
    title: data.title,
    date: data.date,
    summary: data.summary,
    author: data.author,
    coverImage: data.coverImage,
    content,
  };
}

export function getAllPosts(): Post[] {
  const slugs = getPostSlugs();
  const posts = slugs.map((slug: string) => getPostBySlug(slug));

  return posts.sort((a: Post, b: Post) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

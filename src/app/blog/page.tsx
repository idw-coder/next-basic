import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ブログ記事一覧",
  description: "ブログ記事一覧",
};

const articles = [
  { id: "1", title: "title1" },
  { id: "2", title: "title2" },
  { id: "3", title: "title3" },
];

async function fetchArticles() {
  await new Promise((resoleve) => {
    setTimeout(resoleve, 3000);
    // throw new Error('エラーが発生')
  });
  return articles;
}

export default async function BlogPage() {
  const articles = await fetchArticles();
  return (
    <div>
      <ul>
        {articles.map((article) => (
          <li key={article.id}>{article.title}</li>
        ))}
      </ul>
    </div>
  );
}

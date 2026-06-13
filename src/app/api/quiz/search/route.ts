import { Quiz } from '@/entities/Quiz';
import { QuizTag } from '@/entities/QuizTag';
import { QuizTagging } from '@/entities/QuizTagging';
import { getDataSource } from '@/lib/datasource';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// GET /api/quiz/search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || undefined;
    const categoryId = searchParams.get('categoryId') || undefined;
    const tagSlug = searchParams.get('tagSlug') || undefined;

    const ds = await getDataSource();
    const quizRepo = ds.getRepository(Quiz);
    let qb = quizRepo
      .createQueryBuilder('quiz')
      .leftJoinAndSelect('quiz.category', 'category')
      .orderBy('quiz.id', 'ASC');

    if (categoryId) {
      const cid = Number(categoryId);
      if (!Number.isFinite(cid)) {
        return NextResponse.json({ error: 'Invalid categoryId' }, { status: 400 });
      }
      qb = qb.andWhere('quiz.categoryId = :cid', { cid });
    }

    if (tagSlug) {
      qb = qb
        .innerJoin(QuizTagging, 'tagging', 'tagging.quiz_id = quiz.id')
        .innerJoin(QuizTag, 'tag', 'tag.id = tagging.quiz_tag_id AND tag.slug = :tagSlug', {
          tagSlug,
        });
    }

    if (q) {
      qb = qb.andWhere('(quiz.question LIKE :q OR quiz.explanation LIKE :q)', { q: `%${q}%` });
    }

    const quizzes = await qb.getMany();

    const quizIds = quizzes.map((quiz) => quiz.id);
    const taggingRepo = ds.getRepository(QuizTagging);
    const taggings =
      quizIds.length > 0
        ? await taggingRepo.find({
            where: quizIds.map((id) => ({ quizId: id })),
            relations: { quizTag: true },
          })
        : [];

    const tagsByQuizId = new Map<number, { id: number; slug: string; name: string }[]>();
    for (const tagging of taggings) {
      const existing = tagsByQuizId.get(tagging.quizId) ?? [];
      existing.push({
        id: tagging.quizTag.id,
        slug: tagging.quizTag.slug,
        name: tagging.quizTag.name,
      });
      tagsByQuizId.set(tagging.quizId, existing);
    }

    const list = quizzes.map((quiz) => ({
      id: quiz.id,
      slug: quiz.slug,
      category_id: quiz.categoryId,
      category_slug: quiz.category?.slug ?? null,
      category_name: quiz.category?.categoryName ?? null,
      question: quiz.question,
      tags: tagsByQuizId.get(quiz.id) ?? [],
    }));

    return NextResponse.json(list);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

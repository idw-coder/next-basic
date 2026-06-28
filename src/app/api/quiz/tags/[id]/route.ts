import { NextResponse } from 'next/server';
import { QuizTag } from '@/entities/QuizTag';
import { QuizTagging } from '@/entities/QuizTagging';
import { getDataSource } from '@/lib/datasource';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const tagId = Number(id);

  if (!Number.isInteger(tagId) || tagId <= 0) {
    return NextResponse.json({ error: 'Invalid tag id' }, { status: 400 });
  }

  try {
    const ds = await getDataSource();
    const result = await ds.transaction(async (manager) => {
      const tagRepo = manager.getRepository(QuizTag);
      const tag = await tagRepo.findOne({ where: { id: tagId } });

      if (!tag) {
        return null;
      }

      const detached = await manager
        .getRepository(QuizTagging)
        .delete({ quizTagId: tagId });
      await tagRepo.delete(tagId);

      return {
        deletedId: tagId,
        detachedCount: detached.affected ?? 0,
      };
    });

    if (!result) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to delete quiz tag:', error);
    return NextResponse.json(
      { error: 'Failed to delete quiz tag' },
      { status: 500 },
    );
  }
}

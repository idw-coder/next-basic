'use client';

import { useState } from 'react';
import Link from 'next/link';
import ExplanationView from './ExplanationView';

interface Choice {
  id: number;
  choice_text: string;
  is_correct: boolean;
  display_order?: number;
}

interface QuizDetail {
  id: number;
  slug: string;
  category_id: number;
  question: string;
  explanation?: string;
  choices: Choice[];
}

export default function QuizClient({
  quiz,
  categorySlug,
}: {
  quiz: QuizDetail | null;
  categorySlug: string;
}) {
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const handleAnswer = () => {
    if (selectedChoice !== null) {
      setIsAnswered(true);
    }
  };

  if (!quiz) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">問題が見つかりません</h1>
        <Link href={`/quiz/${categorySlug}`} className="text-blue-600 hover:underline">
          問題一覧に戻る
        </Link>
      </div>
    );
  }

  const correctChoice = quiz.choices.find(c => c.is_correct);
  const isCorrect = selectedChoice !== null && 
    quiz.choices.find(c => c.id === selectedChoice)?.is_correct;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Link href={`/quiz/${categorySlug}`} className="text-blue-600 hover:underline mb-4 inline-block">
          ← 問題一覧に戻る
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {quiz.question}
        </h2>

        <div className="space-y-3 mb-6">
          {quiz.choices.map((choice) => {
            const isSelected = selectedChoice === choice.id;
            const showCorrect = isAnswered && choice.is_correct;
            const showWrong = isAnswered && isSelected && !choice.is_correct;

            return (
              <button
                key={choice.id}
                onClick={() => !isAnswered && setSelectedChoice(choice.id)}
                disabled={isAnswered}
                className={`
                  w-full text-left p-4 rounded border-2 transition
                  ${isAnswered ? 'cursor-not-allowed' : 'cursor-pointer hover:border-blue-400'}
                  ${isSelected && !isAnswered ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
                  ${showCorrect ? 'border-green-500 bg-green-50' : ''}
                  ${showWrong ? 'border-red-500 bg-red-50' : ''}
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`
                    w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0
                    ${isSelected && !isAnswered ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}
                    ${showCorrect ? 'border-green-500 bg-green-500' : ''}
                    ${showWrong ? 'border-red-500 bg-red-500' : ''}
                  `}>
                    {(isSelected || showCorrect || showWrong) && (
                      <span className="text-white text-sm">✓</span>
                    )}
                  </div>
                  <span className="text-gray-900">{choice.choice_text}</span>
                </div>
              </button>
            );
          })}
        </div>

        {!isAnswered ? (
          <button
            onClick={handleAnswer}
            disabled={selectedChoice === null}
            className={`
              w-full py-3 px-6 rounded font-semibold transition
              ${selectedChoice === null
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
              }
            `}
          >
            回答する
          </button>
        ) : (
          <div className="space-y-4">
            <div className={`
              p-4 rounded border-2
              ${isCorrect ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}
            `}>
              <p className={`font-bold text-lg mb-2 ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                {isCorrect ? '正解です' : '不正解です'}
              </p>
              {!isCorrect && correctChoice && (
                <p className="text-gray-700">
                  正解: {correctChoice.choice_text}
                </p>
              )}
            </div>

            {quiz.explanation && (
              <div className="bg-gray-50 border border-gray-200 rounded p-4">
                <h3 className="font-bold text-gray-900 mb-2">解説</h3>
                <ExplanationView explanation={quiz.explanation} />
              </div>
            )}

            <Link
              href={`/quiz/${categorySlug}`}
              className="block w-full text-center py-3 px-6 bg-gray-600 text-white rounded font-semibold hover:bg-gray-700 transition"
            >
              問題一覧に戻る
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
import * as repo from '../repositories/submission.repository.js'
import AppError from '../../../common/utils/AppError.js';

export const submitAssignment = async ({ studentId, assignmentId, answers }) => {
  const assignment = await repo.getAssignmentWithQuestions(assignmentId);
  if (!assignment) throw new AppError("Assignment not found", 404);

  let score = 0;

  for (const q of assignment.questions) {
    const userAnswer = answers.find(a => a.questionId === q.id);
    if (!userAnswer) continue;

    const correct = q.options.find(o => o.isCorrect);

    if (userAnswer.optionId === correct.id) {
      score += q.degree;
    }
  }

  const passed = score >= assignment.passDegree;

  return repo.createSubmission({
    studentId,
    assignmentId,
    score,
    passed
  });
};

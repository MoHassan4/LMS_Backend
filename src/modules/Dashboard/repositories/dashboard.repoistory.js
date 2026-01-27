import prisma from "../../../config/prisma.js";

/**
 * الإحصائيات السريعة (6)
 */
export const getStats = async () => {
  const courses = await prisma.course.findMany({
    select: {
      price: true,
      students: true,
    },
  });

  const totalRevenue = courses.reduce(
    (sum, course) => sum + course.price * course.students.length,
    0
  );

  const [
    totalStudents,
    studentsThisMonth,
    activeSubscriptions,
    activeCourses,
    newSubscriptions,
  ] = await Promise.all([
    prisma.student.count(),
    prisma.student.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setDate(1)),
        },
      },
    }),
    prisma.studentCourse.count(),
    prisma.course.count(),
    prisma.studentCourse.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setDate(1)),
        },
      },
    }),
  ]);

  return {
    totalStudents,
    studentsThisMonth,
    activeSubscriptions,
    activeCourses,
    newSubscriptions,
    totalRevenue,
  };
};

/**
 * توزيع الاشتراكات
 */
export const getSubscriptionsDistribution = async () => {
  const courses = await prisma.course.findMany({
    select: {
      title: true,
      students: true,
    },
  });

  const totalSubscriptions = courses.reduce(
    (acc, c) => acc + c.students.length,
    0
  );

  return courses.map((course) => ({
    course: course.title,
    count: course.students.length,
    percentage: totalSubscriptions
      ? Number(
          ((course.students.length / totalSubscriptions) * 100).toFixed(2)
        )
      : 0,
  }));
};


/**
 * الأداء الشهري (بين الطلاب والكورسات)
 */
export const getMonthlyPerformance = async () => {
  const results = await prisma.assignment.findMany({
    where: {
      status: "CLOSED",
    },
    select: {
      createdAt: true,
      questions: {
        select: {
          degree: true,
        },
      },
    },
  });

  // grouping by day (مبسط)
  return results.map((item) => ({
    date: item.createdAt.toISOString().split("T")[0],
    averageScore:
      item.questions.reduce((a, q) => a + q.degree, 0) /
      (item.questions.length || 1),
    submissions: item.questions.length,
  }));
};

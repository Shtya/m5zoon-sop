import { PrismaClient, Role, IssueSeverity, IssueStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.trainingStepProgress.deleteMany();
  await prisma.trainingEnrollment.deleteMany();
  await prisma.trainingPathStep.deleteMany();
  await prisma.trainingPath.deleteMany();
  await prisma.sopView.deleteMany();
  await prisma.sopFeedback.deleteMany();
  await prisma.sopAcknowledgment.deleteMany();
  await prisma.sopComment.deleteMany();
  await prisma.sopHistory.deleteMany();
  await prisma.sopCountry.deleteMany();
  await prisma.issueComment.deleteMany();
  await prisma.issueAffectedUser.deleteMany();
  await prisma.issueCountry.deleteMany();
  await prisma.issue.deleteMany();
  await prisma.sop.deleteMany();
  await prisma.user.deleteMany();
  await prisma.country.deleteMany();

  await prisma.country.createMany({
    data: [
      { id: "ae", name: "الإمارات", flag: "AE", color: "#10B981" },
      { id: "sa", name: "السعودية", flag: "SA", color: "#22c55e" },
      { id: "jo", name: "الأردن", flag: "JO", color: "#ef4444" },
      { id: "om", name: "عُمان", flag: "OM", color: "#f59e0b" },
    ],
  });

  const hash = async (password: string) => bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      id: "u1",
      name: "Omar Hassan",
      email: "omar@makhzon.com",
      passwordHash: await hash("admin123"),
      role: Role.super_admin,
      department: "operations",
      active: true,
      avatar: "OH",
      phone: "0501234567",
      position: "Operations Director",
      createdAt: new Date("2024-01-01"),
    },
  });
  await prisma.user.create({
    data: {
      id: "u2",
      name: "Sara Ahmed",
      email: "sara@makhzon.com",
      passwordHash: await hash("sara123"),
      role: Role.admin,
      department: "call-center",
      active: true,
      avatar: "SA",
      phone: "0509876543",
      position: "Call Center Manager",
      createdAt: new Date("2024-02-15"),
    },
  });
  await prisma.user.create({
    data: {
      id: "u3",
      name: "Khaled Nour",
      email: "khaled@makhzon.com",
      passwordHash: await hash("khaled123"),
      role: Role.team_leader,
      department: "warehouse",
      active: true,
      avatar: "KN",
      phone: "0505551234",
      position: "Warehouse Team Leader",
      createdAt: new Date("2024-03-10"),
    },
  });
  await prisma.user.create({
    data: {
      id: "u4",
      name: "Nada Farouk",
      email: "nada@makhzon.com",
      passwordHash: await hash("nada123"),
      role: Role.employee,
      department: "call-center",
      active: true,
      avatar: "NF",
      phone: "0503334455",
      position: "Call Center Agent",
      createdAt: new Date("2024-04-01"),
    },
  });
  await prisma.user.create({
    data: {
      id: "u5",
      name: "Youssef Ali",
      email: "youssef@makhzon.com",
      passwordHash: await hash("youssef123"),
      role: Role.employee,
      department: "shipping",
      active: false,
      avatar: "YA",
      phone: "0507778899",
      position: "Shipping Agent",
      createdAt: new Date("2024-05-20"),
    },
  });

  await prisma.sop.create({
    data: {
      id: "sop-001",
      department: "call-center",
      title: "التعامل مع عنوان ناقص",
      objective: "التأكد من الحصول على العنوان الصحيح للتوصيل في أسرع وقت ممكن",
      steps: [
        { id: "s1", text: "تواصل مع العميل على رقم الهاتف المسجل خلال ساعة من إنشاء الطلب" },
        { id: "s2", text: "اطلب تأكيد العنوان كاملاً: المنطقة، الشارع، رقم المبنى، الدور" },
        { id: "s3", text: "حدّث العنوان في النظام فوراً بعد الحصول عليه" },
        { id: "s4", text: "غيّر حالة الطلب إلى Confirmed" },
        { id: "s5", text: "أرسل رسالة تأكيد للعميل عبر واتساب" },
      ],
      decisionRules: [
        { condition: "لم يرد العميل خلال ساعتين", action: "أرسل رسالة واتساب وانتظر ساعة إضافية" },
        { condition: "العنوان غير مفهوم بعد التواصل", action: "صعّد الأمر لـ Team Leader" },
      ],
      escalationContacts: [
        { problemType: "عنوان غلط أو ناقص", name: "Sara Ahmed", position: "Call Center Manager", phone: "0509876543" },
        { problemType: "شكوى عميل", name: "Omar Hassan", position: "Operations Director", phone: "0501234567" },
      ],
      commonMistakes: ["تحديث العنوان دون تغيير الحالة", "الانتظار أكثر من ساعة قبل التواصل"],
      videoLink: "",
      keywords: ["عنوان", "توصيل", "ناقص", "عميل"],
      relatedStatuses: ["Waiting for Address", "On Hold"],
      relatedActions: ["Update Address", "Contact Customer"],
      attachments: [{ type: "google_doc", label: "نموذج تحديث العنوان", url: "https://docs.google.com/document/d/example" }],
      views: 142,
      helpfulCount: 38,
      notHelpfulCount: 3,
      createdAt: new Date("2024-12-01"),
      updatedAt: new Date("2025-01-15"),
      reviewDate: new Date("2025-07-15"),
      version: "1.2",
      createdById: "u2",
      updatedById: "u1",
      countries: { create: [{ countryId: "ae" }, { countryId: "sa" }, { countryId: "jo" }, { countryId: "om" }] },
      history: {
        create: [
          {
            version: "1.0",
            userId: "u2",
            changeReason: "إنشاء أولي",
            createdAt: new Date("2024-12-01"),
            currentContent: { title: "التعامل مع عنوان ناقص" },
          },
          {
            version: "1.2",
            userId: "u1",
            changeReason: "تحديث وقت التصعيد",
            createdAt: new Date("2025-01-15"),
          },
        ],
      },
      comments: {
        create: [{ id: "c1", userId: "u4", text: "مفيد جداً وساعدني كتير", createdAt: new Date("2025-01-20") }],
      },
      acknowledgments: {
        create: [{ userId: "u4", version: "1.2", createdAt: new Date("2025-01-20") }],
      },
    },
  });

  await prisma.sop.create({
    data: {
      id: "sop-002",
      department: "warehouse",
      title: "إجراء تعبئة وتغليف الطلبات",
      objective: "ضمان تغليف صحيح وآمن لكل الطلبات قبل الشحن",
      steps: [
        { id: "s1", text: "افتح الطلب على النظام وتأكد من صحة المنتجات والكميات" },
        { id: "s2", text: "اختر حجم الكرتونة المناسب بناءً على حجم المنتج" },
        { id: "s3", text: "لف المنتج بالباول مرتين على الأقل للمنتجات الهشة" },
        { id: "s4", text: "ضع ورقة الفاتورة داخل الكرتونة" },
        { id: "s5", text: "أغلق الكرتونة بشريط لاصق من 3 جهات" },
        { id: "s6", text: "الصق ستيكر الشحن بشكل واضح على الوجه الأمامي" },
      ],
      decisionRules: [
        { condition: "المنتج كبير لا يدخل في أكبر كرتونة", action: "استخدم تغليف خاص وأبلغ المشرف" },
        { condition: "المنتج مكسور أو تالف", action: "لا تعبّئ - أبلغ المشرف فوراً" },
      ],
      escalationContacts: [
        { problemType: "منتج تالف أو خاطئ", name: "Khaled Nour", position: "Warehouse Team Leader", phone: "0505551234" },
      ],
      commonMistakes: ["عدم فحص المنتج قبل التغليف", "وضع ستيكر الشحن على الجانب"],
      keywords: ["تغليف", "تعبئة", "شحن", "كرتونة"],
      relatedStatuses: ["Confirmed", "Packed"],
      relatedActions: ["Confirm Order"],
      attachments: [{ type: "word", label: "دليل التغليف الكامل", url: "https://example.com/guide.docx" }],
      views: 89,
      helpfulCount: 27,
      notHelpfulCount: 1,
      createdAt: new Date("2024-11-15"),
      updatedAt: new Date("2025-01-10"),
      reviewDate: new Date("2025-08-10"),
      version: "2.0",
      createdById: "u1",
      countries: { create: [{ countryId: "ae" }, { countryId: "sa" }] },
      history: {
        create: [
          {
            version: "2.0",
            userId: "u1",
            changeReason: "إعادة هيكلة كاملة",
            createdAt: new Date("2025-01-10"),
          },
        ],
      },
      acknowledgments: {
        create: [{ userId: "u3", version: "2.0", createdAt: new Date("2025-01-10") }],
      },
    },
  });

  await prisma.issue.create({
    data: {
      id: "iss-001",
      title: "شركة الشحن بتأخر في الاستلام أكتر من 24 ساعة",
      department: "shipping",
      category: "shipping_co",
      severity: IssueSeverity.high,
      status: IssueStatus.resolved,
      issueDate: new Date("2025-03-10"),
      reportedById: "u3",
      createdById: "u3",
      description:
        "شركة Aramex بتأخرت في استلام الطرود لمدة يومين مما أدى لتأخر توصيل 47 طلب وشكاوى عملاء متعددة.",
      rootCauses: ["لم يتم تأكيد موعد الاستلام مسبقاً", "لا يوجد خطة بديلة عند تأخر الشركة"],
      solution: "تم التواصل مع المشرف في Aramex وتحديد موعد استلام طارئ في نفس اليوم.",
      preventionSteps: [
        "تأكيد موعد الاستلام من الشركة قبل 24 ساعة",
        "الاحتفاظ بشركة شحن بديلة",
        "وضع حد أقصى للانتظار ساعتين",
      ],
      isRecurring: false,
      recurrenceCount: 1,
      countries: { create: [{ countryId: "ae" }] },
      affectedUsers: { create: [{ userId: "u3" }, { userId: "u5" }] },
      comments: {
        create: [
          { id: "ic1", userId: "u1", text: "تم حل المشكلة، يرجى تطبيق خطوات التجنب", createdAt: new Date("2025-03-10") },
        ],
      },
    },
  });

  await prisma.issue.create({
    data: {
      id: "iss-002",
      title: "أخطاء متكررة في إدخال بيانات الطلبات",
      department: "data-entry",
      category: "system",
      severity: IssueSeverity.medium,
      status: IssueStatus.recurring,
      issueDate: new Date("2025-03-15"),
      reportedById: "u2",
      createdById: "u2",
      description: "موظفو إدخال البيانات يكررون أخطاء في حقول العنوان ورقم الهاتف مما يسبب فشل التوصيل.",
      rootCauses: ["لا يوجد validation على حقول الإدخال", "الموظفين لم يتلقوا تدريباً كافياً"],
      solution: "تم تطبيق validation rules وعمل جلسة تدريبية للموظفين.",
      preventionSteps: ["مراجعة إدخالات كل موظف أول أسبوع", "وضع قائمة تحقق بجانب كل موظف"],
      videoLink: "https://youtube.com/example",
      isRecurring: true,
      recurrenceCount: 4,
      countries: {
        create: [{ countryId: "ae" }, { countryId: "sa" }, { countryId: "jo" }, { countryId: "om" }],
      },
      affectedUsers: { create: [{ userId: "u2" }, { userId: "u4" }] },
    },
  });

  await prisma.trainingPath.create({
    data: {
      id: "path-cc-new",
      title: "مسار Call Center — الموظف الجديد",
      department: "call-center",
      description: "أول أيامك في الكول سنتر: اقرأ الإجراءات، شاهد الفيديوهات، ونفّذ المهام قبل ما تبدأ الشفت لوحدك.",
      active: true,
      createdById: "u1",
      steps: {
        create: [
          {
            sortOrder: 0,
            type: "read_content",
            title: "مرحباً بك في الفريق",
            description: "اقرأ سياسة العمل والتواصل مع العملاء",
            content:
              "1) التزم بمواعيد الشفت.\n2) استخدم لغة مهذبة مع العميل.\n3) سجّل كل مكالمة على النظام.\n4) لو المشكلة أكبر من صلاحياتك، صعّد لـ Team Leader.",
            required: true,
          },
          {
            sortOrder: 1,
            type: "read_sop",
            title: "اقرأ SOP: التعامل مع عنوان ناقص",
            description: "فهم خطوات تحديث العنوان قبل ما ترد على أول طلب",
            sopId: "sop-001",
            required: true,
          },
          {
            sortOrder: 2,
            type: "watch_video",
            title: "شاهد فيديو التواصل مع العميل",
            description: "فيديو توضيحي لطريقة طلب العنوان بأدب",
            videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            required: true,
          },
          {
            sortOrder: 3,
            type: "task",
            title: "نفّذ مهمة تدريبية",
            description: "تمرين عملي قبل الشفت الحقيقي",
            content:
              "افتح محاكاة طلب بحالة Waiting for Address، اطلب العنوان من العميل (تمرين)، وحدّث الحالة إلى Confirmed. بعد ما تخلص اضغط «تم».",
            required: true,
          },
          {
            sortOrder: 4,
            type: "read_content",
            title: "قواعد التصعيد",
            description: "متى تصعّد ومتى تحل بنفسك",
            content:
              "صعّد فورًا إذا: العميل غاضب جدًا، العنوان غير مفهوم بعد محاولتين، أو طلب استرداد مبلغ. غير ذلك حاول الحل ضمن صلاحياتك أولًا.",
            required: true,
          },
        ],
      },
      enrollments: {
        create: [{ userId: "u4", status: "in_progress", startedAt: new Date("2025-01-18") }],
      },
    },
  });

  console.log("Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

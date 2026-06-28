/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LessonPlan, DataStatus, LessonClassification } from '../types';

// Hàm kiểm tra quy tắc thuật ngữ môn học (Rule-based Validation)
export interface TerminologyCheckResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function checkSubjectTerminology(subject: string, part4Techniques: string): TerminologyCheckResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const normalizedSubject = subject.trim().toLowerCase();

  // Quy tắc 1: Môn học chính thức theo chương trình mới bắt buộc dùng từ “Công nghệ”.
  // Tuyệt đối không dùng "Kĩ thuật" hay "Kỹ thuật" thay thế cho tên môn học.
  if (normalizedSubject.includes('kĩ thuật') || normalizedSubject.includes('kỹ thuật')) {
    if (!normalizedSubject.includes('công nghệ')) {
      errors.push('Tên môn học bắt buộc phải sử dụng chính xác là "Công nghệ". Không dùng từ "Kĩ thuật/Kỹ thuật" để thay thế tên môn học.');
    }
  } else if (normalizedSubject !== 'công nghệ' && normalizedSubject !== 'môn công nghệ' && !normalizedSubject.startsWith('công nghệ')) {
    warnings.push('Môn học chính thức chuẩn mới nên đặt là "Công nghệ" (hoặc bắt đầu bằng "Công nghệ") để tương thích hoàn hảo.');
  }

  // Quy tắc 2: Cụm từ “kĩ thuật dạy học” chỉ được dùng khi nói về phương pháp/kĩ thuật giảng dạy, không dùng thay tên môn học.
  const normalizedTechniques = part4Techniques.toLowerCase();
  if (normalizedTechniques.includes('môn kĩ thuật') || normalizedTechniques.includes('môn kỹ thuật')) {
    errors.push('Cụm từ "kĩ thuật" chỉ được dùng khi mô tả "Kĩ thuật dạy học" trong mục sư phạm. Không dùng từ này để lồng ghép thay tên môn học.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// Hàm khởi tạo một giáo án khung trắng (Scaffold) tuân thủ 8 phần Việt Nam
export function createEmptyScaffold(ownerId: string): LessonPlan {
  return {
    id: `plan_${Date.now()}`,
    ownerId,
    title: 'Bài 1: Khái quát về Công nghệ',
    grade: 'Lớp 10',
    subject: 'Công nghệ',
    duration: '2 tiết',
    status: DataStatus.SCAFFOLD,
    classification: LessonClassification.TOPIC_STRAND,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),

    part1: {
      className: 'Lớp 10A1',
      subjectName: 'Công nghệ',
      lessonTitle: 'Bài 1: Khái quát về Công nghệ',
      duration: '2 tiết (90 phút)',
    },

    part2: {
      knowledgeAndSkills: '- Trình bày được khái niệm về công nghệ, mối quan hệ giữa khoa học, kỹ thuật và công nghệ.\n- Trình bày được một số lĩnh vực công nghệ phổ biến hiện nay.',
      generalCapacity: '- Năng lực tự chủ và tự học: Tự lực giải quyết các nhiệm vụ học tập nghiên cứu về khái niệm công nghệ.\n- Năng lực giao tiếp và hợp tác: Làm việc nhóm hiệu quả để thảo luận về vai trò của công nghệ.',
      specificCapacity: '- Năng lực nhận thức công nghệ: Phân biệt được các nhóm công nghệ phổ biến.\n- Năng lực đánh giá công nghệ: Nhận diện tầm ảnh hưởng của công nghệ đến đời sống sản xuất.',
      qualities: '- Chăm chỉ: Tích cực học hỏi các thành tựu công nghệ mới.\n- Trách nhiệm: Ý thức được tác động môi trường khi ứng dụng công nghệ.',
      evaluationEvidence: '- Phiếu bài tập cá nhân về phân loại công nghệ.\n- Sản phẩm thảo luận sơ đồ tư duy mối quan hệ giữa Khoa học - Kỹ thuật - Công nghệ.',
    },

    part3: {
      teacherEquipment: '- Máy tính giảng dạy, máy chiếu (Projector).\n- Bài trình chiếu đa phương tiện (Slides).\n- Sơ đồ tư duy liên kết Khoa học - Kỹ thuật - Công nghệ.',
      studentEquipment: '- Sách giáo khoa Công nghệ 10.\n- Vở ghi chép, bút dạ, giấy khổ lớn A1 cho thảo luận nhóm.',
      sources: 'Sách giáo khoa Công nghệ 10 - Bộ kết nối tri thức với cuộc sống, Bộ GD&ĐT Việt Nam',
      copyrightLicense: 'Sử dụng miễn phí cho mục đích giáo dục phi thương mại (CC BY-NC 4.0)',
    },

    part4: {
      methods: 'Phương pháp dạy học giải quyết vấn đề, Dạy học hợp tác theo nhóm.',
      techniques: 'Kĩ thuật động não (Brainstorming), Kĩ thuật khăn trải bàn, Kĩ thuật mảnh ghép.',
    },

    part5: {
      warmup: {
        target: 'Tạo tâm thế học tập, kích thích trí tò mò của học sinh về khái niệm công nghệ.',
        content: 'Giáo viên chiếu hình ảnh chiếc điện thoại thông minh từ xưa đến nay và yêu cầu học sinh thảo luận sự thay đổi này do yếu tố nào thúc đẩy.',
        product: 'Các câu trả lời nhanh của học sinh, nhận diện được sự phát triển của công nghệ.',
        execution: {
          transfer: 'Giáo viên giao nhiệm vụ qua slide, đặt câu hỏi: "Vì sao điện thoại ngày càng mỏng hơn và thông minh hơn? Ai đã làm nên sự thay đổi này?"',
          perform: 'Học sinh quan sát, trao đổi nhanh theo cặp trong thời gian 2 phút.',
          report: 'Đại diện 2-3 học sinh phát biểu trước lớp. Các học sinh khác nhận xét, bổ sung.',
          conclude: 'Giáo viên tổng hợp ý kiến, dẫn dắt vào bài học mới: Khoa học nghiên cứu ra nguyên lý, Kỹ thuật thiết kế giải pháp, và Công nghệ hiện thực hóa thành sản phẩm tiện ích.',
        },
      },
      exploration: {
        target: 'Học sinh nắm vững khái niệm Công nghệ và mối quan hệ hữu cơ với Khoa học, Kỹ thuật.',
        content: 'Đọc SGK, phân tích các ví dụ cụ thể về mối quan hệ giữa Khoa học (vật lý bán dẫn), Kỹ thuật (thiết kế vi mạch) và Công nghệ (chế tạo chip).',
        product: 'Sơ đồ tư duy hoàn chỉnh trên giấy A1 của các nhóm.',
        execution: {
          transfer: 'Giáo viên chia lớp thành 4 nhóm, phát giấy A1 và bút dạ, yêu cầu hoàn thiện sơ đồ tư duy so sánh Khoa học, Kỹ thuật, Công nghệ.',
          perform: 'Các nhóm thảo luận, viết kết quả lên giấy A1 trong 10 phút.',
          report: 'Nhóm 1 và Nhóm 3 treo sản phẩm. Đại diện nhóm trình bày. Nhóm 2 và 4 phản biện.',
          conclude: 'Giáo viên nhận xét tinh thần thảo luận, chuẩn hóa kiến thức trên slide bài giảng.',
        },
      },
      practice: {
        target: 'Luyện tập phân loại một số lĩnh vực công nghệ tiêu biểu trong đời sống.',
        content: 'Hoàn thành phiếu học tập số 1: Phân loại các công nghệ sau: Công nghệ sinh học, Công nghệ nano, Công nghệ thông tin, Công nghệ chế tạo máy.',
        product: 'Phiếu học tập số 1 đã điền đầy đủ thông tin đáp án.',
        execution: {
          transfer: 'Giáo viên phát phiếu học tập cá nhân, yêu cầu làm việc độc lập trong 5 phút.',
          perform: 'Học sinh suy nghĩ và điền câu trả lời vào phiếu.',
          report: 'Giáo viên gọi ngẫu nhiên một số học sinh đọc đáp án. Tổ chức cho cả lớp tự so sánh chéo.',
          conclude: 'Giáo viên chốt đáp án đúng, chấm điểm khích lệ đối với học sinh hoàn thành xuất sắc nhất.',
        },
      },
      application: {
        target: 'Vận dụng kiến thức để đánh giá vai trò của công nghệ đối với gia đình học sinh.',
        content: 'Viết một bài thu hoạch ngắn (khoảng 150 chữ) kể tên và nhận xét vai trò của 3 sản phẩm công nghệ đang giúp ích nhiều nhất cho việc sinh hoạt của gia đình em.',
        product: 'Đoạn văn ngắn trong vở bài tập của học sinh.',
        execution: {
          transfer: 'Giáo viên giao bài tập về nhà, hướng dẫn nộp bài thông qua nhóm học tập hoặc chấm trực tiếp đầu giờ tiết sau.',
          perform: 'Học sinh làm việc độc lập ở nhà sau tiết học.',
          report: 'Nộp bài vào đầu tiết học tiếp theo.',
          conclude: 'Giáo viên đánh giá chung và rút kinh nghiệm cho tiết học sau.',
        },
      },
    },

    part6: {
      diagnostic: '- Đánh giá thường xuyên thông qua mức độ tích cực thảo luận nhóm.\n- Kiểm tra chéo phiếu học tập số 1 giữa các bàn học.',
      formative: '- Kết quả đánh giá bài thu hoạch ngắn ứng dụng công nghệ tại gia đình.',
    },

    part7: {
      remedial: '- Giảng giải thêm bằng ví dụ trực quan đối với học sinh còn mơ hồ giữa "Kỹ thuật" và "Công nghệ".\n- Phát câu hỏi trắc nghiệm cấp độ nhận biết đơn giản cho học sinh yếu.',
      enrichment: '- Yêu cầu học sinh khá giỏi tìm hiểu thêm về định hướng phát triển của Công nghệ bán dẫn và Trí tuệ nhân tạo (AI) tại Việt Nam.',
    },

    part8: {
      notes: 'Học sinh hào hứng thảo luận phần điện thoại thông minh. Cần phân bổ thêm thời gian cho hoạt động 2 ở các lớp học sau vì nội dung lý thuyết mối quan hệ tương đối trừu tượng.',
    },
  };
}

// Bộ dữ liệu mẫu Giáo án (Seed Data) chuẩn Việt Nam để giáo viên tham khảo ngay
export const SEED_LESSON_PLANS: LessonPlan[] = [
  {
    id: 'plan_seed_001',
    ownerId: 'system_seed_account',
    title: 'Bài 2: Hệ thống kỹ thuật trong Công nghệ',
    grade: 'Lớp 10',
    subject: 'Công nghệ',
    duration: '2 tiết',
    status: DataStatus.SEED,
    classification: LessonClassification.OFFICIAL_LESSON,
    createdAt: '2026-06-25T08:00:00Z',
    updatedAt: '2026-06-25T10:00:00Z',

    part1: {
      className: 'Lớp 10A2',
      subjectName: 'Công nghệ',
      lessonTitle: 'Bài 2: Hệ thống kỹ thuật trong Công nghệ',
      duration: '2 tiết',
    },

    part2: {
      knowledgeAndSkills: '- Định nghĩa được hệ thống kỹ thuật, nhận diện được các phần tử cơ bản của một hệ thống kỹ thuật (Đầu vào, Bộ xử lý, Đầu ra, Liên hệ ngược).\n- Phân tích được một số sơ đồ hệ thống kỹ thuật đơn giản trong gia đình.',
      generalCapacity: '- Năng lực giải quyết vấn đề sáng tạo: Đề xuất giải pháp khắc phục sự cố hệ thống đơn giản.\n- Năng lực tự chủ: Tự nghiên cứu tài liệu hệ thống gia dụng.',
      specificCapacity: '- Năng lực công nghệ: Hiểu được cấu trúc và nguyên lý vận hành của các thiết bị có tính hệ thống.',
      qualities: '- Trung thực: Ghi nhận chính xác kết quả đo đạc khảo sát hệ thống.\n- Chăm chỉ: Vận dụng kiến thức sửa chữa thiết bị nhỏ tại gia đình.',
      evaluationEvidence: '- Bảng phân tích các phần tử hệ thống của máy sấy tóc hoặc bàn là.\n- Sơ đồ tự vẽ hệ thống điều hòa nhiệt độ.',
    },

    part3: {
      teacherEquipment: '- Mô hình tháo rời hoặc sơ đồ mô phỏng bàn là điện, máy sấy tóc.\n- Máy tính, tivi trình chiếu sơ đồ khối.',
      studentEquipment: '- Sách giáo khoa Công nghệ 10.\n- Sơ đồ photo máy sấy tóc do giáo viên cung cấp.',
      sources: 'Bộ Sách giáo khoa Công nghệ 10 - Nhà xuất bản Giáo dục Việt Nam',
      copyrightLicense: 'Creative Commons CC BY-ND 4.0',
    },

    part4: {
      methods: 'Phương pháp trực quan, Phương pháp thực hành phân tích sơ đồ khối.',
      techniques: 'Kĩ thuật đặt câu hỏi, Kĩ thuật suy nghĩ - cặp đôi - chia sẻ (Think-Pair-Share).',
    },

    part5: {
      warmup: {
        target: 'Học sinh nhận diện khái niệm hệ thống thông qua ví dụ trực quan về cơ thể hoặc thiết bị.',
        content: 'Học sinh xem sơ đồ hoạt động của chiếc máy bơm nước tự động ngắt khi đầy bể.',
        product: 'Nhận xét sơ bộ của học sinh về cơ chế hoạt động của phao điện máy bơm.',
        execution: {
          transfer: 'Giáo viên đặt câu hỏi: "Làm thế nào máy bơm biết bể đã đầy nước để tự tắt?"',
          perform: 'Học sinh làm việc cá nhân suy nghĩ trong 1 phút.',
          report: '2 học sinh phát biểu, chỉ ra bộ phận phao đóng vai trò truyền tín hiệu ngược lại máy bơm.',
          conclude: 'Giáo viên dẫn dắt: Thiết bị tự động ngắt này chính là một hệ thống kỹ thuật có vòng lặp liên hệ ngược. Hôm nay chúng ta sẽ tìm hiểu cấu trúc hệ thống này.',
        },
      },
      exploration: {
        target: 'Học sinh phân tích thành công 3 phần tử cốt lõi của hệ thống kỹ thuật.',
        content: 'Nghiên cứu SGK, phân tích các khối: Đầu vào (Input), Bộ xử lý (Process), Đầu ra (Output) và đường truyền liên hệ ngược (Feedback).',
        product: 'Sơ đồ khối vẽ trên vở ghi của học sinh.',
        execution: {
          transfer: 'Giáo viên yêu cầu vẽ sơ đồ khối tổng quát và điền tên các thành phần đối với bàn là điện.',
          perform: 'Học sinh làm việc cá nhân kết hợp thảo luận cặp đôi.',
          report: 'Một học sinh lên bảng vẽ sơ đồ khối và giải thích trước lớp.',
          conclude: 'Giáo viên chuẩn hóa: Đầu vào là điện năng + cài đặt nhiệt độ; Bộ xử lý là thanh lưỡng kim/mạch điện tử; Đầu ra là nhiệt năng tỏa ra; Liên hệ ngược là thanh lưỡng kim ngắt mạch khi đạt nhiệt độ cài đặt.',
        },
      },
      practice: {
        target: 'Vận dụng phân tích sơ đồ khối đối với thiết bị gia dụng quen thuộc khác.',
        content: 'Phân tích hệ thống kỹ thuật của chiếc nồi cơm điện gia đình.',
        product: 'Bảng phân tích 4 phần tử hệ thống nồi cơm điện trong vở bài tập.',
        execution: {
          transfer: 'Giáo viên giao nhiệm vụ hoàn thành bảng phân tích nồi cơm điện theo nhóm bàn trong 5 phút.',
          perform: 'Học sinh trao đổi nhóm bàn và viết đáp án vào vở.',
          report: 'Đại diện một nhóm trình bày, các nhóm khác bổ sung ý kiến phản biện.',
          conclude: 'Giáo viên nhận xét và tổng kết sơ đồ chuẩn cho nồi cơm điện.',
        },
      },
      application: {
        target: 'Vận dụng tư duy hệ thống phát hiện sự cố thường gặp.',
        content: 'Trả lời câu hỏi: "Nếu chiếc quạt điện nhà em bật nút nhưng cánh quạt không quay mà chỉ nghe tiếng e e phát ra từ động cơ, hãy phán đoán bộ phận nào trong hệ thống kỹ thuật đang bị hỏng?"',
        product: 'Đáp án phán đoán và lý giải logic của học sinh.',
        execution: {
          transfer: 'Giáo viên nêu câu hỏi thực tế để học sinh về nhà suy nghĩ tìm hiểu.',
          perform: 'Học sinh làm việc độc lập tại nhà, có thể hỏi ý kiến người thân am hiểu kỹ thuật.',
          report: 'Trả lời bài tập bằng văn bản hoặc phát biểu vào đầu giờ học tiếp theo.',
          conclude: 'Giáo viên chốt giải pháp mẫu: Thường là do tụ điện khởi động (bộ xử lý/kích hoạt) bị hỏng hoặc trục quạt bị kẹt khô dầu (đầu ra cơ học).',
        },
      },
    },

    part6: {
      diagnostic: '- Quan sát câu hỏi gợi mở đầu giờ học.\n- Đánh giá khả năng tự vẽ sơ đồ khối trên bảng của học sinh.',
      formative: '- Đánh giá độ chuẩn xác của bảng phân tích nồi cơm điện nhóm.',
    },

    part7: {
      remedial: '- Cung cấp thêm hình ảnh linh kiện thực tế (thanh lưỡng kim, tụ điện) để học sinh yếu dễ hình dung bộ xử lý.',
      enrichment: '- Khuyến khích học sinh khá giỏi tìm hiểu thêm về hệ thống kỹ thuật mạch kín (Closed-loop system) ứng dụng trong các cảm biến thông minh của SmartHome.',
    },

    part8: {
      notes: 'Bài học trực quan nên học sinh tiếp thu rất nhanh. Phân tích nồi cơm điện gần gũi nên tương tác lớp học vô cùng tốt.',
    },
  },
  {
    id: 'plan_seed_002',
    ownerId: 'system_seed_account',
    title: 'Bài 5: Bản vẽ kĩ thuật và quy chuẩn trình bày',
    grade: 'Lớp 11',
    subject: 'Công nghệ',
    duration: '2 tiết',
    status: DataStatus.SEED,
    classification: LessonClassification.OFFICIAL_LESSON,
    createdAt: '2026-06-26T09:00:00Z',
    updatedAt: '2026-06-26T11:00:00Z',

    part1: {
      className: 'Lớp 11B3',
      subjectName: 'Công nghệ',
      lessonTitle: 'Bài 5: Bản vẽ kĩ thuật và quy chuẩn trình bày',
      duration: '2 tiết',
    },

    part2: {
      knowledgeAndSkills: '- Trình bày được các quy chuẩn cơ bản về bản vẽ kĩ thuật: Khổ giấy, tỷ lệ, nét vẽ, chữ viết và ghi kích thước (theo tiêu chuẩn TCVN).\n- Giải thích được tầm quan trọng của việc tuân thủ các quy chuẩn kỹ thuật.',
      generalCapacity: '- Năng lực giao tiếp: Đọc hiểu và truyền đạt thông tin kỹ thuật bằng hình ảnh.\n- Năng lực chính xác: Rèn luyện tính tỉ mỉ, cẩn thận tuyệt đối.',
      specificCapacity: '- Năng lực thiết kế công nghệ: Trình bày ý tưởng thiết kế đúng tiêu chuẩn quy ước.',
      qualities: '- Chăm chỉ: Rèn luyện kỹ năng vẽ đều tay, sạch sẽ.\n- Trung thực: Tuân thủ đúng tỷ lệ thực tế, không vẽ ước lượng sai lệch.',
      evaluationEvidence: '- Bài thực hành vẽ các đường nét cơ bản trên khổ giấy A4 đúng quy chuẩn đường viền và khung tên.',
    },

    part3: {
      teacherEquipment: '- Bản vẽ mẫu khổ lớn A0 đúng quy chuẩn TCVN.\n- Bộ thước vẽ kỹ thuật chuyên dụng, máy chiếu, bài slide.',
      studentEquipment: '- Sách giáo khoa Công nghệ 11 (Vẽ kĩ thuật).\n- Giấy vẽ A4, bút chì 2B/HB, thước kẻ, tẩy.',
      sources: 'Sách giáo khoa Công nghệ 11 - Thiết kế và Công nghệ - Bộ Chân trời sáng tạo',
      copyrightLicense: 'Sử dụng phi thương mại phục vụ học tập giảng dạy',
    },

    part4: {
      methods: 'Phương pháp thuyết trình trực quan kết hợp hướng dẫn thao tác mẫu (Demonstration).',
      techniques: 'Kĩ thuật làm mẫu, Kĩ thuật phản hồi tích cực.',
    },

    part5: {
      warmup: {
        target: 'Kích thích học sinh hiểu tầm quan trọng của ngôn ngữ kỹ thuật chuẩn hóa.',
        content: 'Xem hai bức vẽ mô tả cùng một vật thể: Một bức vẽ tự do không ghi kích thước, một bức vẽ kỹ thuật chuẩn chỉnh. Đặt câu hỏi so sánh.',
        product: 'Nhận thức ban đầu về sự cần thiết của quy chuẩn chung để kỹ sư chế tạo có thể hiểu đúng.',
        execution: {
          transfer: 'Giáo viên chiếu 2 bức vẽ, hỏi: "Nếu đưa bức vẽ thứ nhất cho thợ cơ khí, họ có chế tạo được sản phẩm chính xác hay không? Tại sao?"',
          perform: 'Học sinh thảo luận nhóm bàn trong 2 phút.',
          report: 'Đại diện học sinh trả lời: Không thể chế tạo chính xác vì thiếu thông số kích thước và quy chuẩn tỷ lệ.',
          conclude: 'Giáo viên chốt: Bản vẽ kĩ thuật được coi là "ngôn ngữ của kỹ thuật". Để mọi người ở mọi quốc gia đều hiểu giống nhau, bắt buộc phải có quy chuẩn chung. Hôm nay chúng ta học tiêu chuẩn TCVN.',
        },
      },
      exploration: {
        target: 'Học sinh nắm vững 5 quy chuẩn trình bày bản vẽ cơ bản.',
        content: 'Tự nghiên cứu SGK về: Khổ giấy (A0-A4), Tỷ lệ (phóng to, thu nhỏ, nguyên hình), Nét vẽ (liên đậm, liên mảnh, nét đứt, gạch chấm), Ghi kích thước.',
        product: 'Bảng ghi nhớ tóm tắt các quy chuẩn vẽ kỹ thuật vào vở ghi.',
        execution: {
          transfer: 'Giáo viên phân công nhiệm vụ: Nhóm 1 đọc khổ giấy; Nhóm 2 đọc tỷ lệ; Nhóm 3 đọc các nét vẽ; Nhóm 4 đọc quy tắc ghi kích thước. Ghi tóm tắt nội dung vào vở.',
          perform: 'Học sinh làm việc cá nhân rồi thảo luận nhóm trong 7 phút.',
          report: 'Đại diện từng nhóm phát biểu tóm tắt nội dung quy chuẩn của nhóm mình.',
          conclude: 'Giáo viên hệ thống hóa, trực quan hóa cách ghi kích thước (đầu mũi tên, đường dóng, vị trí con số kích thước luôn ở phía trên đường ghi kích thước).'
        },
      },
      practice: {
        target: 'Học sinh thực hành vẽ đúng các loại đường nét kỹ thuật trên giấy A4.',
        content: 'Vẽ khung bản vẽ (cách mép giấy 5mm, mép trái 20mm), khung tên góc dưới bên phải và thực hành vẽ 4 đoạn thẳng đại diện cho 4 loại nét vẽ thông dụng.',
        product: 'Trang giấy vẽ A4 hoàn thiện bước đầu đúng khung tên và các nét vẽ.',
        execution: {
          transfer: 'Giáo viên hướng dẫn thao tác mẫu trên bảng, yêu cầu học sinh làm theo trên giấy A4 cá nhân.',
          perform: 'Học sinh thực hành cá nhân dưới sự giám sát và uốn nắn trực tiếp của giáo viên.',
          report: 'Học sinh hoàn thành nộp bài vẽ tại chỗ hoặc mang lên bàn giáo viên rà soát lỗi.',
          conclude: 'Giáo viên chỉ ra một số lỗi phổ biến như: Vẽ nét đứt quá dày, đặt số kích thước dưới đường ghi kích thước, khung tên sai vị trí.'
        },
      },
      application: {
        target: 'Vận dụng đọc hiểu các quy chuẩn trên bản vẽ lắp ráp thực tế.',
        content: 'Về nhà, học sinh tìm một bản vẽ lắp đặt hướng dẫn sử dụng tủ gỗ tháo lắp hoặc thiết bị IKEA, nhận diện xem họ dùng tỷ lệ gì, ký hiệu kích thước ra sao.',
        product: 'Bản ghi chép thu hoạch phát hiện quy chuẩn của học sinh.',
        execution: {
          transfer: 'Giáo viên giao nhiệm vụ và gợi ý nguồn tìm bản vẽ thực tế trong đời sống.',
          perform: 'Học sinh làm độc lập ở nhà.',
          report: 'Báo cáo vào đầu tiết học tiếp theo.',
          conclude: 'Giáo viên đánh giá sự quan sát và khả năng liên hệ thực tế của học sinh.'
        },
      },
    },

    part6: {
      diagnostic: '- Kiểm tra sự sẵn sàng dụng cụ học tập (giấy A4, bút chì, thước kẻ).\n- Câu hỏi thảo luận nhanh về kích thước khổ giấy.',
      formative: '- Chấm điểm bài vẽ kỹ thuật thực hành A4 (Khung viền, chữ viết, độ đậm nét vẽ).',
    },

    part7: {
      remedial: '- Cầm tay chỉ việc uốn nắn đối với học sinh vẽ nét bị run hoặc mờ.\n- Hỗ trợ học sinh yếu các quy tắc đặt con số kích thước tránh bị ngược hướng.',
      enrichment: '- Khuyến khích học sinh khá giỏi tìm hiểu thêm về quy chuẩn bản vẽ cơ khí 3D và giới thiệu sơ bộ phần mềm CAD (Computer-Aided Design) trong công nghệ thiết kế.',
    },

    part8: {
      notes: 'Nội dung thực hành đòi hỏi sự yên tĩnh và tỉ mỉ. Học sinh rất hào hứng khi tự tay hoàn thiện khung tên bản vẽ kỹ thuật đúng tiêu chuẩn quốc gia.',
    },
  },
];

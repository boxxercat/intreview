package com.rookies5.intreview.controller;

import com.rookies5.intreview.dto.request.CoachPracticeAnswerRequest;
import com.rookies5.intreview.dto.request.CreatePreparationQuestionRequest;
import com.rookies5.intreview.dto.request.PatchPreparationQuestionRequest;
import com.rookies5.intreview.dto.response.ApiResponse;
import com.rookies5.intreview.dto.response.CoachPracticeAnswerResponse;
import com.rookies5.intreview.dto.response.PageResponse;
import com.rookies5.intreview.dto.response.PreparationQuestionResponse;
import com.rookies5.intreview.service.PracticeAnswerCoachingService;
import com.rookies5.intreview.service.PreparationQuestionService;
import com.rookies5.intreview.web.UserIdHeader;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/preparation-questions")
@RequiredArgsConstructor
public class PreparationQuestionController {

    private final PreparationQuestionService preparationQuestionService;
    private final PracticeAnswerCoachingService practiceAnswerCoachingService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<PreparationQuestionResponse>>> list(
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        long userId = UserIdHeader.parseRequired(xUserId);
        PageResponse<PreparationQuestionResponse> data = preparationQuestionService.list(userId, pageable);
        return ResponseEntity.ok(ApiResponse.ok(data, "준비 질문 목록 조회가 완료되었습니다."));
    }

    @GetMapping("/{preparationQuestionId}")
    public ResponseEntity<ApiResponse<PreparationQuestionResponse>> get(
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @PathVariable long preparationQuestionId
    ) {
        long userId = UserIdHeader.parseRequired(xUserId);
        PreparationQuestionResponse data = preparationQuestionService.get(userId, preparationQuestionId);
        return ResponseEntity.ok(ApiResponse.ok(data, "준비 질문 상세 조회가 완료되었습니다."));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PreparationQuestionResponse>> create(
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @Valid @RequestBody CreatePreparationQuestionRequest request
    ) {
        long userId = UserIdHeader.parseRequired(xUserId);
        PreparationQuestionResponse data = preparationQuestionService.create(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(data, "준비 질문이 등록되었습니다."));
    }

    @PostMapping("/{preparationQuestionId}/coach-practice-answer")
    public ResponseEntity<ApiResponse<CoachPracticeAnswerResponse>> coachPracticeAnswer(
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @PathVariable long preparationQuestionId,
            @Valid @RequestBody CoachPracticeAnswerRequest request
    ) {
        long userId = UserIdHeader.parseRequired(xUserId);
        CoachPracticeAnswerResponse data = practiceAnswerCoachingService.coach(
                userId,
                preparationQuestionId,
                request.practiceAnswerDraft()
        );
        return ResponseEntity.ok(ApiResponse.ok(data, "연습 답변 첨삭이 완료되었습니다."));
    }

    @PatchMapping("/{preparationQuestionId}")
    public ResponseEntity<ApiResponse<PreparationQuestionResponse>> patch(
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @PathVariable long preparationQuestionId,
            @Valid @RequestBody PatchPreparationQuestionRequest request
    ) {
        long userId = UserIdHeader.parseRequired(xUserId);
        PreparationQuestionResponse data = preparationQuestionService.patch(userId, preparationQuestionId, request);
        return ResponseEntity.ok(ApiResponse.ok(data, "준비 질문이 수정되었습니다."));
    }

    @DeleteMapping("/{preparationQuestionId}")
    public ResponseEntity<Void> delete(
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @PathVariable long preparationQuestionId
    ) {
        long userId = UserIdHeader.parseRequired(xUserId);
        preparationQuestionService.delete(userId, preparationQuestionId);
        return ResponseEntity.noContent().build();
    }
}

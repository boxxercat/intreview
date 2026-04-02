package com.rookies5.intreview.controller;

import com.rookies5.intreview.dto.request.CreateInterviewQuestionRequest;
import com.rookies5.intreview.dto.request.PatchInterviewQuestionRequest;
import com.rookies5.intreview.dto.response.ApiResponse;
import com.rookies5.intreview.dto.response.InterviewQuestionDetailResponse;
import com.rookies5.intreview.dto.response.InterviewQuestionSummaryResponse;
import com.rookies5.intreview.dto.response.PageResponse;
import com.rookies5.intreview.service.InterviewQuestionService;
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
@RequestMapping("/api/interviews/{interviewId}/questions")
@RequiredArgsConstructor
public class InterviewQuestionController {

    private final InterviewQuestionService interviewQuestionService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<InterviewQuestionSummaryResponse>>> list(
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @PathVariable long interviewId,
            @PageableDefault(size = 20, sort = "sortOrder", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        long userId = UserIdHeader.parseRequired(xUserId);
        PageResponse<InterviewQuestionSummaryResponse> data = interviewQuestionService.list(userId, interviewId, pageable);
        return ResponseEntity.ok(ApiResponse.ok(data, "면접 질문 목록 조회가 완료되었습니다."));
    }

    @GetMapping("/{questionId}")
    public ResponseEntity<ApiResponse<InterviewQuestionDetailResponse>> get(
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @PathVariable long interviewId,
            @PathVariable long questionId
    ) {
        long userId = UserIdHeader.parseRequired(xUserId);
        InterviewQuestionDetailResponse data = interviewQuestionService.get(userId, interviewId, questionId);
        return ResponseEntity.ok(ApiResponse.ok(data, "면접 질문 상세 조회가 완료되었습니다."));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<InterviewQuestionDetailResponse>> create(
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @PathVariable long interviewId,
            @Valid @RequestBody CreateInterviewQuestionRequest request
    ) {
        long userId = UserIdHeader.parseRequired(xUserId);
        InterviewQuestionDetailResponse data = interviewQuestionService.create(userId, interviewId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(data, "면접 질문이 등록되었습니다."));
    }

    @PatchMapping("/{questionId}")
    public ResponseEntity<ApiResponse<InterviewQuestionDetailResponse>> patch(
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @PathVariable long interviewId,
            @PathVariable long questionId,
            @Valid @RequestBody PatchInterviewQuestionRequest request
    ) {
        long userId = UserIdHeader.parseRequired(xUserId);
        InterviewQuestionDetailResponse data = interviewQuestionService.patch(userId, interviewId, questionId, request);
        return ResponseEntity.ok(ApiResponse.ok(data, "면접 질문이 수정되었습니다."));
    }

    @DeleteMapping("/{questionId}")
    public ResponseEntity<Void> delete(
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @PathVariable long interviewId,
            @PathVariable long questionId
    ) {
        long userId = UserIdHeader.parseRequired(xUserId);
        interviewQuestionService.delete(userId, interviewId, questionId);
        return ResponseEntity.noContent().build();
    }
}

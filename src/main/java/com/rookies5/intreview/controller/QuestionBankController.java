package com.rookies5.intreview.controller;

import com.rookies5.intreview.dto.request.CreateQuestionBankQuestionRequest;
import com.rookies5.intreview.dto.request.PatchQuestionBankQuestionRequest;
import com.rookies5.intreview.dto.response.ApiResponse;
import com.rookies5.intreview.dto.response.PageResponse;
import com.rookies5.intreview.dto.response.QuestionBankQuestionDetailResponse;
import com.rookies5.intreview.dto.response.QuestionBankQuestionSummaryResponse;
import com.rookies5.intreview.service.QuestionBankQuestionService;
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
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/question-bank/questions")
@RequiredArgsConstructor
public class QuestionBankController {

    private final QuestionBankQuestionService questionBankQuestionService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<QuestionBankQuestionSummaryResponse>>> list(
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        long userId = UserIdHeader.parseRequired(xUserId);
        PageResponse<QuestionBankQuestionSummaryResponse> data = questionBankQuestionService.list(userId, pageable);
        return ResponseEntity.ok(ApiResponse.ok(data, "질문 자산 목록 조회가 완료되었습니다."));
    }

    @GetMapping("/{questionId}")
    public ResponseEntity<ApiResponse<QuestionBankQuestionDetailResponse>> get(
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @PathVariable long questionId
    ) {
        long userId = UserIdHeader.parseRequired(xUserId);
        QuestionBankQuestionDetailResponse data = questionBankQuestionService.get(userId, questionId);
        return ResponseEntity.ok(ApiResponse.ok(data, "질문 자산 상세 조회가 완료되었습니다."));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<QuestionBankQuestionDetailResponse>> create(
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @Valid @RequestBody CreateQuestionBankQuestionRequest request
    ) {
        long userId = UserIdHeader.parseRequired(xUserId);
        QuestionBankQuestionDetailResponse data = questionBankQuestionService.create(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(data, "질문 자산이 등록되었습니다."));
    }

    @PatchMapping("/{questionId}")
    public ResponseEntity<ApiResponse<QuestionBankQuestionDetailResponse>> patch(
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @PathVariable long questionId,
            @Valid @RequestBody PatchQuestionBankQuestionRequest request
    ) {
        long userId = UserIdHeader.parseRequired(xUserId);
        QuestionBankQuestionDetailResponse data = questionBankQuestionService.patch(userId, questionId, request);
        return ResponseEntity.ok(ApiResponse.ok(data, "질문 자산이 수정되었습니다."));
    }

    @DeleteMapping("/{questionId}")
    public ResponseEntity<Void> delete(
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @PathVariable long questionId
    ) {
        long userId = UserIdHeader.parseRequired(xUserId);
        questionBankQuestionService.delete(userId, questionId);
        return ResponseEntity.noContent().build();
    }
}

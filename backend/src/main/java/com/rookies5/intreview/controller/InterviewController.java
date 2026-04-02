package com.rookies5.intreview.controller;

import com.rookies5.intreview.dto.request.CreateInterviewRequest;
import com.rookies5.intreview.dto.request.UpdateInterviewRequest;
import com.rookies5.intreview.dto.response.ApiResponse;
import com.rookies5.intreview.dto.response.InterviewDetailResponse;
import com.rookies5.intreview.dto.response.InterviewSummaryResponse;
import com.rookies5.intreview.dto.response.PageResponse;
import com.rookies5.intreview.service.InterviewService;
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
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/interviews")
@RequiredArgsConstructor
public class InterviewController {

    private final InterviewService interviewService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<InterviewSummaryResponse>>> list(
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @PageableDefault(size = 20, sort = "interviewDate", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        long userId = UserIdHeader.parseRequired(xUserId);
        PageResponse<InterviewSummaryResponse> data = interviewService.list(userId, pageable);
        return ResponseEntity.ok(ApiResponse.ok(data, "면접 목록 조회가 완료되었습니다."));
    }

    @GetMapping("/{interviewId}")
    public ResponseEntity<ApiResponse<InterviewDetailResponse>> get(
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @PathVariable long interviewId
    ) {
        long userId = UserIdHeader.parseRequired(xUserId);
        InterviewDetailResponse data = interviewService.get(userId, interviewId);
        return ResponseEntity.ok(ApiResponse.ok(data, "면접 상세 조회가 완료되었습니다."));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<InterviewDetailResponse>> create(
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @Valid @RequestBody CreateInterviewRequest request
    ) {
        long userId = UserIdHeader.parseRequired(xUserId);
        InterviewDetailResponse data = interviewService.create(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(data, "면접이 등록되었습니다."));
    }

    @PutMapping("/{interviewId}")
    public ResponseEntity<ApiResponse<InterviewDetailResponse>> update(
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @PathVariable long interviewId,
            @Valid @RequestBody UpdateInterviewRequest request
    ) {
        long userId = UserIdHeader.parseRequired(xUserId);
        InterviewDetailResponse data = interviewService.update(userId, interviewId, request);
        return ResponseEntity.ok(ApiResponse.ok(data, "면접이 수정되었습니다."));
    }

    @DeleteMapping("/{interviewId}")
    public ResponseEntity<Void> delete(
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @PathVariable long interviewId
    ) {
        long userId = UserIdHeader.parseRequired(xUserId);
        interviewService.delete(userId, interviewId);
        return ResponseEntity.noContent().build();
    }
}

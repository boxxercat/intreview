package com.rookies5.intreview.service;

import com.rookies5.intreview.domain.interview.Interview;
import com.rookies5.intreview.domain.user.User;
import com.rookies5.intreview.dto.request.CreateInterviewRequest;
import com.rookies5.intreview.dto.request.UpdateInterviewRequest;
import com.rookies5.intreview.dto.response.InterviewDetailResponse;
import com.rookies5.intreview.dto.response.InterviewSummaryResponse;
import com.rookies5.intreview.dto.response.PageResponse;
import com.rookies5.intreview.exception.ApiException;
import com.rookies5.intreview.exception.ErrorCode;
import com.rookies5.intreview.repository.InterviewRepository;
import com.rookies5.intreview.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class InterviewService {

    private final InterviewRepository interviewRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public PageResponse<InterviewSummaryResponse> list(long userId, Pageable pageable) {
        ensureUserExists(userId);
        Page<Interview> page = interviewRepository.findByUser_Id(userId, pageable);
        return PageResponse.of(page.map(InterviewSummaryResponse::from));
    }

    @Transactional(readOnly = true)
    public InterviewDetailResponse get(long userId, long interviewId) {
        ensureUserExists(userId);
        return InterviewDetailResponse.from(getOwnedOrThrow(userId, interviewId));
    }

    @Transactional
    public InterviewDetailResponse create(long userId, CreateInterviewRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));
        Interview interview = Interview.create(
                user,
                request.companyName().trim(),
                request.positionTitle().trim(),
                request.interviewDate(),
                normalizeOptionalText(request.interviewRound())
        );
        interviewRepository.save(interview);
        return InterviewDetailResponse.from(interview);
    }

    @Transactional
    public InterviewDetailResponse update(long userId, long interviewId, UpdateInterviewRequest request) {
        Interview interview = getOwnedOrThrow(userId, interviewId);
        interview.update(
                request.companyName().trim(),
                request.positionTitle().trim(),
                request.interviewDate(),
                normalizeOptionalText(request.interviewRound())
        );
        return InterviewDetailResponse.from(interview);
    }

    @Transactional
    public void delete(long userId, long interviewId) {
        Interview interview = getOwnedOrThrow(userId, interviewId);
        interviewRepository.delete(interview);
    }

    private void ensureUserExists(long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ApiException(ErrorCode.USER_NOT_FOUND);
        }
    }

    private Interview getOwnedOrThrow(long userId, long interviewId) {
        return interviewRepository.findByIdAndUser_Id(interviewId, userId)
                .orElseGet(() -> {
                    if (interviewRepository.existsById(interviewId)) {
                        throw new ApiException(ErrorCode.ACCESS_DENIED);
                    }
                    throw new ApiException(ErrorCode.INTERVIEW_NOT_FOUND);
                });
    }

    private String normalizeOptionalText(String value) {
        return value == null ? "" : value.trim();
    }
}

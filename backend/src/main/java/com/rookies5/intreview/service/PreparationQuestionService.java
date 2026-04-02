package com.rookies5.intreview.service;

import com.rookies5.intreview.domain.preparation.PreparationQuestion;
import com.rookies5.intreview.domain.questionbank.QuestionBankQuestion;
import com.rookies5.intreview.domain.user.User;
import com.rookies5.intreview.dto.request.CreatePreparationQuestionRequest;
import com.rookies5.intreview.dto.request.PatchPreparationQuestionRequest;
import com.rookies5.intreview.dto.response.PageResponse;
import com.rookies5.intreview.dto.response.PreparationQuestionResponse;
import com.rookies5.intreview.exception.InvalidSourceCombinationException;
import com.rookies5.intreview.exception.PreparationQuestionNotFoundException;
import com.rookies5.intreview.exception.QuestionBankNotFoundException;
import com.rookies5.intreview.exception.ResourceAccessDeniedException;
import com.rookies5.intreview.exception.UserNotFoundException;
import com.rookies5.intreview.repository.PreparationQuestionRepository;
import com.rookies5.intreview.repository.QuestionBankQuestionRepository;
import com.rookies5.intreview.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PreparationQuestionService {

    private final PreparationQuestionRepository preparationQuestionRepository;
    private final QuestionBankQuestionRepository questionBankQuestionRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public PageResponse<PreparationQuestionResponse> list(long userId, Pageable pageable) {
        ensureUserExists(userId);
        Page<PreparationQuestion> page = preparationQuestionRepository.findByOwner_Id(userId, pageable);
        return PageResponse.of(page.map(PreparationQuestionResponse::from));
    }

    @Transactional(readOnly = true)
    public PreparationQuestionResponse get(long userId, long preparationQuestionId) {
        ensureUserExists(userId);
        return PreparationQuestionResponse.from(getOwnedOrThrow(userId, preparationQuestionId));
    }

    @Transactional
    public PreparationQuestionResponse create(long userId, CreatePreparationQuestionRequest request) {
        User owner = userRepository.findById(userId).orElseThrow(UserNotFoundException::new);
        String practiceAnswer = normalizeOptionalText(request.practiceAnswer());
        PreparationQuestion entity = switch (request.sourceType()) {
            case FROM_BANK -> PreparationQuestion.fromBank(
                    owner,
                    getOwnedQuestionBankOrThrow(userId, request.questionBankQuestionId()),
                    practiceAnswer
            );
            case CUSTOM -> PreparationQuestion.fromCustom(
                    owner,
                    requireText(request.questionTextSnapshot()),
                    practiceAnswer
            );
        };
        preparationQuestionRepository.save(entity);
        return PreparationQuestionResponse.from(entity);
    }

    @Transactional
    public PreparationQuestionResponse patch(long userId, long preparationQuestionId, PatchPreparationQuestionRequest request) {
        PreparationQuestion entity = getOwnedOrThrow(userId, preparationQuestionId);
        if (request.questionTextSnapshot() != null) {
            entity.updateQuestionTextSnapshot(requireText(request.questionTextSnapshot()));
        }
        if (request.practiceAnswer() != null) {
            applyOptionalLongText(request.practiceAnswer(), entity::updatePracticeAnswer, entity::clearPracticeAnswer);
        }
        return PreparationQuestionResponse.from(entity);
    }

    @Transactional
    public void delete(long userId, long preparationQuestionId) {
        PreparationQuestion entity = getOwnedOrThrow(userId, preparationQuestionId);
        preparationQuestionRepository.delete(entity);
    }

    private void ensureUserExists(long userId) {
        if (!userRepository.existsById(userId)) {
            throw new UserNotFoundException();
        }
    }

    private PreparationQuestion getOwnedOrThrow(long userId, long preparationQuestionId) {
        return preparationQuestionRepository.findByIdAndOwner_Id(preparationQuestionId, userId)
                .orElseGet(() -> {
                    if (preparationQuestionRepository.existsById(preparationQuestionId)) {
                        throw new ResourceAccessDeniedException();
                    }
                    throw new PreparationQuestionNotFoundException();
                });
    }

    private QuestionBankQuestion getOwnedQuestionBankOrThrow(long userId, Long questionBankQuestionId) {
        if (questionBankQuestionId == null) {
            throw new InvalidSourceCombinationException();
        }
        return questionBankQuestionRepository.findByIdAndOwner_Id(questionBankQuestionId, userId)
                .orElseThrow(() -> {
                    if (questionBankQuestionRepository.existsById(questionBankQuestionId)) {
                        return new ResourceAccessDeniedException();
                    }
                    return new QuestionBankNotFoundException();
                });
    }

    private String requireText(String value) {
        String trimmed = value == null ? null : value.trim();
        if (trimmed == null || trimmed.isEmpty()) {
            throw new InvalidSourceCombinationException();
        }
        return trimmed;
    }

    private String normalizeOptionalText(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private void applyOptionalLongText(String value, java.util.function.Consumer<String> updater, Runnable clearer) {
        String trimmed = value.trim();
        if (trimmed.isEmpty()) {
            clearer.run();
            return;
        }
        updater.accept(trimmed);
    }
}

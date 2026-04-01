package com.rookies5.intreview.repository;

import com.rookies5.intreview.domain.questionbank.QuestionBankQuestion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface QuestionBankQuestionRepository extends JpaRepository<QuestionBankQuestion, Long> {

    Page<QuestionBankQuestion> findByOwner_Id(Long ownerId, Pageable pageable);

    Optional<QuestionBankQuestion> findByIdAndOwner_Id(Long id, Long ownerId);
}

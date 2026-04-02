package com.rookies5.intreview.repository;

import com.rookies5.intreview.domain.preparation.PreparationQuestion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PreparationQuestionRepository extends JpaRepository<PreparationQuestion, Long> {

    Page<PreparationQuestion> findByOwner_Id(Long ownerId, Pageable pageable);

    @EntityGraph(attributePaths = {"questionBankQuestion"})
    Optional<PreparationQuestion> findByIdAndOwner_Id(Long id, Long ownerId);
}

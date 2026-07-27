package com.joaomendonca.lifeos.task;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;

class TaskStatusTests {
  @Test void convertsEveryPublicLabel() {
    assertEquals(TaskStatus.INBOX, TaskStatus.fromLabel("Inbox"));
    assertEquals(TaskStatus.NEXT, TaskStatus.fromLabel("Próxima"));
    assertEquals(TaskStatus.IN_PROGRESS, TaskStatus.fromLabel("Em andamento"));
    assertEquals(TaskStatus.DONE, TaskStatus.fromLabel("Concluída"));
  }

  @Test void rejectsUnknownStatus() {
    var exception = assertThrows(IllegalArgumentException.class, () -> TaskStatus.fromLabel("Talvez"));
    assertTrue(exception.getMessage().contains("Status"));
  }
}

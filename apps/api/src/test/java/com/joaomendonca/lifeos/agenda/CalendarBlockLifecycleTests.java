package com.joaomendonca.lifeos.agenda;
import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;
class CalendarBlockLifecycleTests {
 @Test void newBlockStartsPlannedAndUnsynced(){var block=new CalendarBlockEntity();assertThat(block.getLifecycleStatus()).isEqualTo("PLANNED");assertThat(block.getIntegrationSynced()).isFalse();}
 @Test void classifierKeepsPersonalAsSafeDefault(){assertThat(AgendaClassifier.domain("Consulta dentista","MEETING")).isEqualTo("PERSONAL");}
}

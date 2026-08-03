package com.joaomendonca.lifeos.agenda;
import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;
class AgendaClassifierTests {
 @Test void recognizesGymAliases(){assertThat(AgendaClassifier.isGym("Treino de peito")).isTrue();assertThat(AgendaClassifier.isGym("Academia Smart Fit")).isTrue();}
 @Test void recognizesEnglishStudy(){assertThat(AgendaClassifier.isEnglishStudy("Conversação particular de inglês")).isTrue();assertThat(AgendaClassifier.isEnglishStudy("Aula de gramática")).isTrue();}
 @Test void classifiesDomains(){assertThat(AgendaClassifier.domain("Trabalho","ROUTINE")).isEqualTo("WORK");assertThat(AgendaClassifier.domain("Musculação","ROUTINE")).isEqualTo("HEALTH");assertThat(AgendaClassifier.domain("Estudar inglês","FOCUS")).isEqualTo("STUDY");}
}

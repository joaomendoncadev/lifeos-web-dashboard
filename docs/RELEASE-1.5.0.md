# LifeOS 1.5.0 — Final Stability

Release de fechamento da base v1 para uso pessoal.

## Entregas
- tratamento global e previsível de erros da API;
- execução de testes Java durante o build da imagem;
- teste unitário dos estados de tarefas;
- tela de configurações;
- exportação JSON de projetos, tarefas, hábitos, metas e viagens;
- importação aditiva e não destrutiva;
- preferências locais e modo compacto;
- melhorias de acessibilidade e navegação por teclado;
- pipeline CI para backend, frontend e Compose;
- scripts existentes de backup e restauração documentados.

## Política de dados
A importação JSON nunca remove dados existentes. O backup SQL continua sendo a opção recomendada antes de atualizações.

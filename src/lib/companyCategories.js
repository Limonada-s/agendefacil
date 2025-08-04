
export const companyCategories = {
  MASCULINO: [
    { id: 'masc_cabelo', label: 'Cabelo Masculino', subcategories: [
      'Corte Tradicional', 'Corte Degradê / Fade', 'Corte Navalhado', 'Corte com Tesoura', 
      'Disfarçado na Navalha', 'Corte com Camuflagem de Fios Brancos', 
      'Corte Terapêutico (com massagem e hidratação)', 'Lavagem + Finalização'
    ]},
    { id: 'masc_barba', label: 'Barba', subcategories: [
      'Barba Tradicional', 'Barba com Navalha', 'Barba Desenhada', 
      'Camuflagem de Barba (fios brancos)', 'Pigmentação de Barba', 
      'Hidratação e Massagem Facial', 'Aparar e Limpar'
    ]},
    { id: 'masc_sobrancelha', label: 'Sobrancelha Masculina', subcategories: [
      'Limpeza de Sobrancelha', 'Design Natural', 'Tintura de Sobrancelha', 
      'Henna Masculina', 'Micropigmentação'
    ]},
    { id: 'masc_pele', label: 'Cuidados com a Pele Masculina', subcategories: [
      'Limpeza de Pele Masculina', 'Peeling Químico', 'Microagulhamento', 
      'Máscaras Faciais', 'Controle de Oleosidade'
    ]},
    { id: 'masc_depilacao', label: 'Depilação Masculina', subcategories: [
      'Peito e Abdômen', 'Costas', 'Rosto', 'Axilas', 'Íntima Masculina', 
      'Pernas / Braços', 'Depilação com Linha'
    ]},
    { id: 'masc_massagem_terapias', label: 'Massagem e Terapias Masculinas', subcategories: [
      'Massagem Relaxante', 'Massagem Modeladora', 'Drenagem Linfática', 
      'Reflexologia', 'Ventosaterapia', 'Massagem com Pedras Quentes'
    ]},
    { id: 'masc_estetica_corporal', label: 'Estética Corporal Masculina', subcategories: [
      'Criolipólise', 'Radiofrequência', 'Limpeza de Costas', 
      'Detox Corporal', 'Corrente Russa'
    ]}
  ],
  FEMININO: [
    { id: 'fem_cabelo', label: 'Cabelo Feminino', subcategories: [
      'Corte Feminino', 'Escova Simples / Modelada', 'Hidratação / Nutrição / Reconstrução', 
      'Botox Capilar', 'Progressiva', 'Alisamento / Relaxamento', 
      'Mechas / Luzes / Balayage', 'Coloração / Tonalizante', 
      'Penteados (social, noiva, infantil)', 'Lavagem + Finalização'
    ]},
    { id: 'fem_unhas', label: 'Unhas', subcategories: [
      'Manicure Tradicional', 'Pedicure Tradicional', 'Spa dos Pés', 
      'Esmaltação em Gel', 'Alongamento de Unhas (Gel, Fibra, Acrílico)', 
      'Blindagem de Unhas', 'Nail Art / Decoração'
    ]},
    { id: 'fem_maquiagem', label: 'Maquiagem', subcategories: [
      'Maquiagem Social', 'Maquiagem para Noivas', 'Pré-Wedding', 
      'Maquiagem Artística', 'Aula de AutoMaquiagem'
    ]},
    { id: 'fem_sobrancelhas_olhos', label: 'Sobrancelhas e Olhos', subcategories: [
      'Design de Sobrancelhas', 'Henna / Tintura', 'Micropigmentação / Microblading', 
      'Lifting de Cílios', 'Extensão de Cílios', 'Brow Lamination (Laminamento)'
    ]},
    { id: 'fem_depilacao', label: 'Depilação Feminina', subcategories: [
      'Buço / Rosto', 'Axilas', 'Pernas', 'Virilha / Virilha Total', 
      'Abdômen / Costas', 'Depilação com Linha', 'Fotodepilação'
    ]},
    { id: 'fem_pele', label: 'Cuidados com a Pele Feminina', subcategories: [
      'Limpeza de Pele', 'Peeling Químico', 'Dermaplaning', 
      'Microagulhamento', 'Máscaras e Hidratações', 'Clareamento de Manchas'
    ]},
    { id: 'fem_estetica_corporal', label: 'Estética Corporal Feminina', subcategories: [
      'Drenagem Linfática', 'Massagem Modeladora', 'Massagem Relaxante', 
      'Criolipólise', 'Radiofrequência', 'Lipocavitação', 
      'Corrente Russa', 'Banho de Lua'
    ]}
  ],
  INFANTIL: [
    { id: 'infantil_unissex', label: 'Infantil (Unissex)', subcategories: [
      'Corte Infantil', 'Penteado Infantil', 'Maquiagem Kids', 'Dia de Princesa / Príncipe (pacotinho)'
    ]}
  ]
};

// Lista plana para seleção na CompanyRegistrationPage
export const mainCompanyCategories = [
  ...companyCategories.MASCULINO.map(c => ({ id: c.id, label: c.label, group: "Masculino" })),
  ...companyCategories.FEMININO.map(c => ({ id: c.id, label: c.label, group: "Feminino" })),
  ...companyCategories.INFANTIL.map(c => ({ id: c.id, label: c.label, group: "Infantil" }))
];

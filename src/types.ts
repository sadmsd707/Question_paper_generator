// ─── Core Types ─────────────────────────────────────────────────────────────

export type Exam = 'JEE Main' | 'JEE Advanced' | 'NEET UG' | 'MHT-CET';
export type Subject = 'Physics' | 'Chemistry' | 'Mathematics' | 'Biology' | 'Botany' | 'Zoology';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type QuestionType =
  | 'MCQ Single'
  | 'MCQ Multiple'
  | 'Numerical'
  | 'Integer'
  | 'Assertion-Reason'
  | 'Match the Following'
  | 'Paragraph Based'
  | 'Short Answer';

export interface Option {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options: Option[];
  correctAnswer: string | string[]; // option id(s) or numerical value
  marks: number;
  negativeMarks: number;
  subject: Subject | '';
  chapter: string;
  topic: string;
  difficulty: Difficulty;
  explanation: string;
  imageUrl?: string;
  exam?: Exam;
  createdAt: string;
}

export interface Section {
  id: string;
  title: string;
  subject: Subject | '';
  questionType: QuestionType | '';
  marksPerQuestion: number;
  negativeMarks: number;
  totalQuestions: number;
  isOptional: boolean;
  optionalCount: number;
  questionIds: string[];
}

export interface PaperDetails {
  title: string;
  exam: Exam | '';
  subjects: Subject[];
  targetClass: string;
  academicYear: string;
  duration: string;
  maxMarks: number;
  institution: string;
  teacherName: string;
  instructions: string;
  logoUrl?: string;
}

export interface QuestionPaper {
  id: string;
  details: PaperDetails;
  sections: Section[];
  questions: Question[];
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
  downloadCount: number;
}

export interface AppState {
  // Papers
  papers: QuestionPaper[];
  // Question bank
  questionBank: Question[];
  // Current creation wizard
  wizard: WizardState;
  // Navigation
  currentPage: Page;
  // Teacher profile
  teacher: TeacherProfile;
}

export interface WizardState {
  step: number;
  paperId: string | null;
  details: PaperDetails;
  sections: Section[];
  selectedQuestionIds: string[];
  tempQuestions: Question[];
}

export type Page = 'dashboard' | 'create' | 'my-papers' | 'question-bank' | 'templates' | 'settings';

export interface TeacherProfile {
  name: string;
  email: string;
  institution: string;
  avatar: string;
}

// ─── Exam Config ─────────────────────────────────────────────────────────────
export const EXAM_SUBJECTS: Record<Exam, Subject[]> = {
  'JEE Main': ['Physics', 'Chemistry', 'Mathematics'],
  'JEE Advanced': ['Physics', 'Chemistry', 'Mathematics'],
  'NEET UG': ['Physics', 'Chemistry', 'Biology', 'Botany', 'Zoology'],
  'MHT-CET': ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
};

export const EXAM_COLORS: Record<Exam, string> = {
  'JEE Main': '#d4622a',
  'JEE Advanced': '#8b4513',
  'NEET UG': '#2d7a4f',
  'MHT-CET': '#8b6914',
};

export const EXAM_TEMPLATES: Record<Exam, { sections: Omit<Section, 'id' | 'questionIds'>[] }> = {
  'JEE Main': {
    sections: [
      { title: 'Section A – Single Correct', subject: 'Physics', questionType: 'MCQ Single', marksPerQuestion: 4, negativeMarks: 1, totalQuestions: 20, isOptional: false, optionalCount: 0 },
      { title: 'Section B – Numerical', subject: 'Physics', questionType: 'Numerical', marksPerQuestion: 4, negativeMarks: 0, totalQuestions: 10, isOptional: true, optionalCount: 5 },
    ],
  },
  'JEE Advanced': {
    sections: [
      { title: 'Section 1 – Single Correct', subject: '', questionType: 'MCQ Single', marksPerQuestion: 3, negativeMarks: 1, totalQuestions: 6, isOptional: false, optionalCount: 0 },
      { title: 'Section 2 – Multiple Correct', subject: '', questionType: 'MCQ Multiple', marksPerQuestion: 4, negativeMarks: 2, totalQuestions: 8, isOptional: false, optionalCount: 0 },
      { title: 'Section 3 – Integer Type', subject: '', questionType: 'Integer', marksPerQuestion: 4, negativeMarks: 0, totalQuestions: 6, isOptional: false, optionalCount: 0 },
    ],
  },
  'NEET UG': {
    sections: [
      { title: 'Section A', subject: 'Physics', questionType: 'MCQ Single', marksPerQuestion: 4, negativeMarks: 1, totalQuestions: 35, isOptional: false, optionalCount: 0 },
      { title: 'Section B', subject: 'Physics', questionType: 'MCQ Single', marksPerQuestion: 4, negativeMarks: 1, totalQuestions: 15, isOptional: true, optionalCount: 10 },
    ],
  },
  'MHT-CET': {
    sections: [
      { title: 'Mathematics', subject: 'Mathematics', questionType: 'MCQ Single', marksPerQuestion: 2, negativeMarks: 0, totalQuestions: 50, isOptional: false, optionalCount: 0 },
      { title: 'Physics & Chemistry', subject: 'Physics', questionType: 'MCQ Single', marksPerQuestion: 1, negativeMarks: 0, totalQuestions: 50, isOptional: false, optionalCount: 0 },
    ],
  },
};

export const QUESTION_TYPES: QuestionType[] = [
  'MCQ Single',
  'MCQ Multiple',
  'Numerical',
  'Integer',
  'Assertion-Reason',
  'Match the Following',
  'Paragraph Based',
  'Short Answer',
];

// Real chapters from JEE Main, JEE Advanced, NEET UG, MHT-CET datasets
export const CHAPTERS: Record<Subject, string[]> = {
  Physics: [
    // JEE Main PYQ chapters
    'Alternating Current', 'Atoms and Nuclei', 'Capacitor', 'Center of Mass',
    'Circular Motion', 'Communication Systems', 'Current Electricity',
    'Dual Nature of Radiation', 'Electromagnetic Induction', 'Electromagnetic Waves',
    'Electronic Devices', 'Electrostatics', 'Geometrical Optics', 'Gravitation',
    'Heat and Thermodynamics', 'Laws of Motion', 'Magnetic Properties of Matter',
    'Magnetics', 'Motion in a Plane', 'Motion in a Straight Line',
    'Properties of Matter', 'Rotational Motion', 'Simple Harmonic Motion',
    'Units and Measurements', 'Vector Algebra', 'Wave Optics', 'Waves',
    'Work, Power and Energy',
    // NEET chapters
    'Electric Charges and Fields', 'Electrostatic Potential and Capacitance',
    'Moving Charges and Magnetism', 'Magnetism and Matter',
    'Kinetic Theory', 'Mechanical Properties of Fluids', 'Mechanical Properties of Solids',
    'Nuclei', 'Oscillations', 'Ray Optics and Optical Instruments',
    'Semiconductor Electronics', 'System of Particles and Rotational Motion',
    'Thermal Properties of Matter', 'Thermodynamics', 'Wave Optics',
    // MHT-CET chapters
    'AC Circuits', 'Dual Nature of Radiation and Matter', 'Kinetic Theory of Gases',
    'Magnetic Fields Due to Electric Current', 'Magnetic Materials', 'Optics (Ray)',
    'Rotational Dynamics', 'Semiconductor Devices', 'Sound', 'Structure of Atoms and Nuclei',
    'Superposition of Waves',
    // JEE Advanced
    'Capacitance', 'Elasticity', 'Fluid Mechanics', 'Heat and Thermal Radiation',
    'Magnetic Effects of Current', 'Modern Physics', 'Nuclear Physics & Radioactivity',
    'Thermodynamics & Kinetic Theory', 'Wave Optics & Interference', 'Waves and Oscillations',
  ].sort(),

  Chemistry: [
    // JEE Main PYQ chapters
    'Alcohols, Phenols and Ethers', 'Aldehydes, Ketones and Carboxylic Acids',
    'Basics of Organic Chemistry', 'Biomolecules', 'Chemical Bonding and Molecular Structure',
    'Chemical Equilibrium', 'Chemical Kinetics and Nuclear Chemistry',
    'Chemistry in Everyday Life', 'Compounds Containing Nitrogen',
    'Coordination Compounds', 'D and F Block Elements', 'Electrochemistry',
    'Environmental Chemistry', 'Gaseous State', 'Haloalkanes and Haloarenes',
    'Hydrocarbons', 'Hydrogen', 'Ionic Equilibrium', 'Isolation of Elements',
    'P Block Elements', 'Periodic Table and Periodicity', 'Polymers',
    'Practical Organic Chemistry', 'Redox Reactions', 'S Block Elements',
    'Salt Analysis', 'Solid State', 'Solutions', 'Some Basic Concepts of Chemistry',
    'Structure of Atom', 'Surface Chemistry', 'Thermodynamics',
    // NEET chapters
    'Amines', 'Classification of Elements and Periodicity in Properties',
    'General Principles and Processes of Isolation of Elements',
    'Organic Chemistry – Some Basic Principles and Techniques',
    'States of Matter', 'The d- and f-Block Elements',
    'The p-Block Elements', 'The s-Block Elements',
    // MHT-CET chapters
    'Alkanes', 'Alkenes', 'Alkynes', 'Aromatic Compounds', 'Basic Principles of Organic Chemistry',
    'Chemical Thermodynamics and Energetics', 'Elements of Group 1 and 2',
    'Elements of Group 13, 14 and 15', 'Elements of Group 16, 17 and 18',
    'Green Chemistry and Nanochemistry', 'Halogen Derivatives of Alkanes',
    'Introduction to Polymer Chemistry', 'Modern Periodic Table',
    'Solutions and Colligative Properties', 'Transition and Inner Transition Elements',
  ].sort(),

  Mathematics: [
    // JEE Main PYQ chapters
    '3D Geometry', 'Application of Derivatives', 'Area under the Curves',
    'Binomial Theorem', 'Circle', 'Complex Numbers', 'Definite Integration',
    'Differential Equations', 'Differentiation', 'Ellipse', 'Functions',
    'Height and Distance', 'Hyperbola', 'Indefinite Integrals',
    'Inverse Trigonometric Functions', 'Limits, Continuity and Differentiability',
    'Logarithm', 'Mathematical Induction', 'Mathematical Reasoning',
    'Matrices and Determinants', 'Parabola', 'Permutations and Combinations',
    'Probability', 'Properties of Triangle', 'Quadratic Equation and Inequalities',
    'Sequences and Series', 'Sets and Relations', 'Statistics',
    'Straight Lines and Pair of Straight Lines',
    'Trigonometric Functions and Equations', 'Trigonometric Ratio and Identities',
    // MHT-CET chapters
    'Applications of Definite Integral', 'Applications of Derivative',
    'Binomial Distribution', 'Conic Sections', 'Determinants and Matrices',
    'Line and Plane', 'Linear Programming', 'Mathematical Logic',
    'Pair of Straight Lines', 'Probability Distribution', 'Quadratic Equations',
    'Sets, Relations and Functions', 'Straight Line',
    'Trigonometry - I', 'Trigonometry - II', 'Vectors',
    // JEE Advanced
    'Advanced Mathematics', 'Circles', 'Complex Numbers & Quadratics',
    'Definite & Indefinite Integrals', 'Differential Calculus',
    'Matrices & Determinants', 'Probability & Statistics', 'Sequences & Series',
    'Three-Dimensional Geometry', 'Triangles', 'Vector Algebra',
  ].sort(),

  Biology: [
    // NEET Biology chapters
    'Anatomy of Flowering Plants', 'Animal Kingdom', 'Biodiversity and Conservation',
    'Biological Classification', 'Biotechnology and its Applications',
    'Biotechnology: Principles and Processes', 'Body Fluids and Circulation',
    'Breathing and Exchange of Gases', 'Cell Cycle and Cell Division',
    'Cell: The Unit of Life', 'Chemical Coordination and Integration',
    'Digestion and Absorption', 'Ecosystem', 'Evolution',
    'Excretory Products and their Elimination', 'Human Health and Disease',
    'Human Reproduction', 'Locomotion and Movement', 'Microbes in Human Welfare',
    'Mineral Nutrition', 'Molecular Basis of Inheritance',
    'Morphology of Flowering Plants', 'Neural Control and Coordination',
    'Organisms and Populations', 'Photosynthesis in Higher Plants',
    'Plant Growth and Development', 'Plant Kingdom',
    'Principles of Inheritance and Variation', 'Reproductive Health',
    'Respiration in Plants', 'Sexual Reproduction in Flowering Plants',
    'Structural Organisation in Animals', 'The Living World', 'Transport in Plants',
    // MHT-CET Bio chapters
    'Biodiversity, Conservation and Environmental Issues', 'Biotechnology',
    'Control and Coordination', 'Ecosystems and Energy Flow',
    'Human Health and Diseases', 'Inheritance and Variation',
    'Origin and Evolution of Life', 'Plant Growth and Mineral Nutrition',
    'Plant Water Relation', 'Reproduction in Lower and Higher Animals',
    'Reproduction in Lower and Higher Plants', 'Respiration and Circulation',
  ].sort(),

  Botany: [
    'Anatomy of Flowering Plants', 'Biological Classification', 'Biodiversity and Conservation',
    'Biotechnology: Principles and Processes', 'Cell Cycle and Cell Division',
    'Cell: The Unit of Life', 'Ecosystem', 'Microbes in Human Welfare',
    'Mineral Nutrition', 'Molecular Basis of Inheritance', 'Morphology of Flowering Plants',
    'Organisms and Populations', 'Photosynthesis in Higher Plants',
    'Plant Growth and Development', 'Plant Kingdom', 'Principles of Inheritance and Variation',
    'Reproductive Health', 'Respiration in Plants', 'Sexual Reproduction in Flowering Plants',
    'The Living World', 'Transport in Plants',
  ].sort(),

  Zoology: [
    'Animal Kingdom', 'Biotechnology and its Applications', 'Body Fluids and Circulation',
    'Breathing and Exchange of Gases', 'Chemical Coordination and Integration',
    'Digestion and Absorption', 'Evolution', 'Excretory Products and their Elimination',
    'Human Health and Disease', 'Human Reproduction', 'Locomotion and Movement',
    'Neural Control and Coordination', 'Structural Organisation in Animals',
  ].sort(),
};

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function calculateTotalMarks(sections: Section[]): number {
  return sections.reduce((total, sec) => {
    const qs = sec.isOptional ? sec.optionalCount : sec.totalQuestions;
    return total + qs * sec.marksPerQuestion;
  }, 0);
}

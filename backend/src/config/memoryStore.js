// src/config/memoryStore.js
const bcrypt = require('bcryptjs');

class MemoryStore {
  constructor() {
    this.users = [];
    this.appointments = [];
    this.prescriptions = [];
    this.medicalReports = [];
    this.consultations = [];
    this.followUps = [];
    this.vaccinations = [];
    this.growthRecords = [];
    this.notifications = [];
    this.chats = [];
    this.initDefaultData();
  }

  async initDefaultData() {
    const salt = await bcrypt.genSalt(10);
    const adminPass = await bcrypt.hash('admin123', salt);
    const docPass = await bcrypt.hash('doctor123', salt);
    const patPass = await bcrypt.hash('patient123', salt);
    const nehaPass = await bcrypt.hash('123456', salt);

    this.users = [
      {
        _id: '650000000000000000000001',
        id: '650000000000000000000001',
        name: 'Admin Director',
        email: 'admin@gmail.com',
        altEmail: 'admin@medicare.com',
        password: adminPass,
        role: 'admin',
        approved: true,
        department: 'Operations',
        phone: '+1 (555) 019-2834',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        _id: '650000000000000000000002',
        id: '650000000000000000000002',
        name: 'Dr. Sarah Jenkins',
        email: 'doctor@gmail.com',
        altEmail: 'doctor@medicare.com',
        password: docPass,
        role: 'doctor',
        specialization: 'Cardiology',
        qualifications: 'MD, FACC - Harvard Medical',
        experience: 14,
        fee: 150,
        rating: 4.9,
        reviewsCount: 128,
        bio: 'Senior Cardiologist specializing in preventive cardiology, heart rhythm management, and echocardiography.',
        availability: [
          { day: 'Monday', slots: ['09:00 AM', '10:30 AM', '02:00 PM', '03:30 PM'] },
          { day: 'Tuesday', slots: ['09:00 AM', '11:00 AM', '02:00 PM'] },
          { day: 'Wednesday', slots: ['09:00 AM', '11:00 AM', '01:30 PM', '04:00 PM'] },
          { day: 'Thursday', slots: ['09:00 AM', '11:00 AM', '03:00 PM'] },
          { day: 'Friday', slots: ['09:00 AM', '10:00 AM', '11:30 AM', '02:00 PM'] }
        ],
        approved: true,
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        _id: '650000000000000000000003',
        id: '650000000000000000000003',
        name: 'Dr. Marcus Vance',
        email: 'marcus.vance@medicare.com',
        password: docPass,
        role: 'doctor',
        specialization: 'Neurology',
        qualifications: 'MD, PhD - Johns Hopkins',
        experience: 11,
        fee: 180,
        rating: 4.8,
        reviewsCount: 94,
        bio: 'Consultant Neurologist with expertise in migraine management, neuromuscular disorders, and neuro-rehabilitation.',
        availability: [
          { day: 'Tuesday', slots: ['10:00 AM', '11:30 AM', '03:00 PM'] },
          { day: 'Thursday', slots: ['09:30 AM', '01:00 PM', '03:30 PM'] }
        ],
        approved: true,
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        _id: '650000000000000000000004',
        id: '650000000000000000000004',
        name: 'Dr. Elena Rostova',
        email: 'elena.rostova@medicare.com',
        password: docPass,
        role: 'doctor',
        specialization: 'Pediatrics',
        qualifications: 'MD, FAAP - Stanford University',
        experience: 8,
        fee: 120,
        rating: 4.95,
        reviewsCount: 156,
        bio: 'Caring pediatrician focused on newborn care, developmental assessments, and pediatric vaccinations.',
        availability: [
          { day: 'Monday', slots: ['08:30 AM', '10:00 AM', '01:00 PM'] },
          { day: 'Wednesday', slots: ['09:00 AM', '11:30 AM', '02:30 PM'] },
          { day: 'Saturday', slots: ['09:00 AM', '10:30 AM', '12:00 PM'] }
        ],
        approved: true,
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        _id: '650000000000000000000005',
        id: '650000000000000000000005',
        name: 'Dr. David Chen',
        email: 'david.chen@medicare.com',
        password: docPass,
        role: 'doctor',
        specialization: 'Orthopedics',
        qualifications: 'MS (Ortho), FRCS',
        experience: 16,
        fee: 160,
        rating: 4.85,
        reviewsCount: 110,
        bio: 'Orthopedic surgeon focusing on joint replacements, sports injuries, and spine rehabilitation.',
        availability: [
          { day: 'Tuesday', slots: ['09:00 AM', '11:00 AM', '02:00 PM'] },
          { day: 'Thursday', slots: ['10:00 AM', '01:30 PM', '04:00 PM'] }
        ],
        approved: true,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        _id: '650000000000000000000006',
        id: '650000000000000000000006',
        name: 'Dr. Alex Rivera',
        email: 'alex.rivera@medicare.com',
        password: docPass,
        role: 'doctor',
        specialization: 'Dermatology',
        qualifications: 'MD, FAAD - NYU Medical',
        experience: 7,
        fee: 130,
        rating: 4.8,
        reviewsCount: 62,
        bio: 'Board-certified dermatologist specializing in medical dermatology, acne therapy, and laser skincare.',
        availability: [
          { day: 'Monday', slots: ['10:00 AM', '11:30 AM', '02:00 PM', '04:00 PM'] },
          { day: 'Wednesday', slots: ['09:30 AM', '11:00 AM', '03:00 PM'] },
          { day: 'Friday', slots: ['10:00 AM', '01:00 PM', '03:30 PM'] }
        ],
        approved: true,
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        _id: '650000000000000000000012',
        id: '650000000000000000000012',
        name: 'Dr. Dikshant Sharma',
        email: 'dikshant@medicare.com',
        password: docPass,
        role: 'doctor',
        specialization: 'Dermatology',
        qualifications: 'MD (Dermatology & Cosmetology), FAAD - Stanford Health',
        experience: 12,
        fee: 140,
        rating: 4.95,
        reviewsCount: 142,
        bio: 'Senior Consultant Dermatologist & Clinical Trichologist specializing in advanced skin therapeutics, eczema, allergy diagnostics, and restorative skincare.',
        availability: [
          { day: 'Monday', slots: ['09:00 AM', '10:30 AM', '02:00 PM', '04:30 PM'] },
          { day: 'Tuesday', slots: ['10:00 AM', '11:30 AM', '03:00 PM'] },
          { day: 'Thursday', slots: ['09:00 AM', '11:00 AM', '02:30 PM', '04:00 PM'] },
          { day: 'Saturday', slots: ['10:00 AM', '12:00 PM', '02:00 PM'] }
        ],
        approved: true,
        createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        _id: '650000000000000000000007',
        id: '650000000000000000000007',
        name: 'Dr. Olivia Thorne',
        email: 'olivia.thorne@medicare.com',
        password: docPass,
        role: 'doctor',
        specialization: 'General Medicine',
        qualifications: 'MBBS, MD - Mayo Clinic',
        experience: 9,
        fee: 100,
        rating: 4.9,
        reviewsCount: 88,
        bio: 'Dedicated primary care physician focused on chronic condition management, wellness, and preventative health.',
        availability: [
          { day: 'Monday', slots: ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'] },
          { day: 'Thursday', slots: ['09:00 AM', '11:00 AM', '02:00 PM'] }
        ],
        approved: true,
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        _id: '650000000000000000000008',
        id: '650000000000000000000008',
        name: 'John Doe',
        email: 'patient@gmail.com',
        altEmail: 'patient@medicare.com',
        password: patPass,
        role: 'patient',
        bloodGroup: 'O+',
        age: 34,
        gender: 'Male',
        phone: '+1 (555) 234-5678',
        address: '742 Evergreen Terrace, Springfield',
        emergencyContact: 'Jane Doe (+1 555-987-6543)',
        approved: true,
        createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        _id: '650000000000000000000009',
        id: '650000000000000000000009',
        name: 'Emily Watson',
        email: 'emily.w@example.com',
        password: patPass,
        role: 'patient',
        bloodGroup: 'A+',
        age: 29,
        gender: 'Female',
        phone: '+1 (555) 345-6789',
        address: '124 Blossom Hill Road, San Jose',
        approved: true,
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        _id: '650000000000000000000010',
        id: '650000000000000000000010',
        name: 'Robert Miller',
        email: 'robert.m@example.com',
        password: patPass,
        role: 'patient',
        bloodGroup: 'B+',
        age: 52,
        gender: 'Male',
        phone: '+1 (555) 456-7890',
        address: '88 Riverview Drive, Austin',
        approved: true,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        _id: '650000000000000000000011',
        id: '650000000000000000000011',
        name: 'Neha Sharma',
        email: 'neha@gmail.com',
        password: nehaPass,
        role: 'patient',
        bloodGroup: 'B+',
        age: 26,
        gender: 'Female',
        phone: '+1 (555) 678-9012',
        address: '500 Tech Park, Suite 4B',
        emergencyContact: 'Rajesh Sharma (+1 555-890-1234)',
        approved: true,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      }
    ];

    this.appointments = [
      {
        _id: '650000000000000000000021',
        patient: '650000000000000000000008', // John Doe
        doctor: '650000000000000000000002', // Dr. Sarah Jenkins
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        timeSlot: '10:30 AM',
        status: 'accepted',
        reason: 'Cardiac checkup and blood pressure review',
        notes: 'Patient reported mild palpitations after exercise.',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        _id: '650000000000000000000022',
        patient: '650000000000000000000008', // John Doe
        doctor: '650000000000000000000003', // Dr. Marcus Vance
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        timeSlot: '11:30 AM',
        status: 'pending',
        reason: 'Frequent migraines and sleep disturbances',
        notes: 'Requested preliminary consultation.',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        _id: '650000000000000000000023',
        patient: '650000000000000000000009', // Emily Watson
        doctor: '650000000000000000000002', // Dr. Sarah Jenkins
        date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        timeSlot: '02:00 PM',
        status: 'pending',
        reason: 'Annual heart wellness screening',
        notes: 'Follow-up on lipid panel results.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: '650000000000000000000024',
        patient: '650000000000000000000010', // Robert Miller
        doctor: '650000000000000000000005', // Dr. David Chen
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        timeSlot: '10:00 AM',
        status: 'completed',
        reason: 'Knee joint pain after running',
        notes: 'Recommended physical therapy and anti-inflammatory treatment.',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        _id: '650000000000000000000025',
        patient: '650000000000000000000011', // Neha Sharma
        doctor: '650000000000000000000012', // Dr. Dikshant Sharma
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        timeSlot: '10:30 AM',
        status: 'accepted',
        reason: 'Dermatology consultation for skin barrier hydration and allergy evaluation',
        notes: 'Confirmed by Dr. Dikshant Sharma. Please bring previous allergy history.',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        _id: '650000000000000000000026',
        patient: '650000000000000000000011', // Neha Sharma
        doctor: '650000000000000000000002', // Dr. Sarah Jenkins
        date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        timeSlot: '09:00 AM',
        status: 'pending',
        reason: 'Routine cardiovascular fitness checkup and wellness advisory',
        notes: 'Waiting for physician slot confirmation.',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    this.prescriptions = [
      {
        _id: '650000000000000000000031',
        patient: '650000000000000000000008', // John Doe
        doctor: '650000000000000000000002', // Dr. Sarah Jenkins
        diagnosis: 'Stage 1 Hypertension & Hyperlipidemia',
        medicines: [
          { name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily at bedtime', duration: '30 days' },
          { name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily morning', duration: '30 days' },
          { name: 'Aspirin (Cardio)', dosage: '81mg', frequency: 'Once daily after lunch', duration: '60 days' }
        ],
        notes: 'Follow low-sodium DASH diet. Daily 30 min brisk walk. Re-check BP in 3 weeks.',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        _id: '650000000000000000000032',
        patient: '650000000000000000000010', // Robert Miller
        doctor: '650000000000000000000005', // Dr. David Chen
        diagnosis: 'Patellofemoral Pain Syndrome',
        medicines: [
          { name: 'Celecoxib', dosage: '200mg', frequency: 'Twice daily with meals', duration: '10 days' },
          { name: 'Glucosamine Sulfate', dosage: '1500mg', frequency: 'Once daily', duration: '60 days' }
        ],
        notes: 'Apply ice pack 15 mins twice daily. Avoid heavy weight lifting.',
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        _id: '650000000000000000000033',
        patient: '650000000000000000000011', // Neha Sharma
        doctor: '650000000000000000000012', // Dr. Dikshant Sharma
        diagnosis: 'Contact Dermatitis & Skin Barrier Repair',
        medicines: [
          { name: 'Desonide Cream 0.05%', dosage: 'Thin layer', frequency: 'Twice daily on affected areas', duration: '14 days' },
          { name: 'Ceramide Moisturizing Lotion', dosage: 'Liberal amount', frequency: 'Three times daily after wash', duration: '30 days' },
          { name: 'Levocetirizine', dosage: '5mg', frequency: 'Once daily at bedtime (night)', duration: '10 days' }
        ],
        notes: 'Avoid scented soaps and chemical exfoliants. Maintain proper skin hydration and use broad spectrum SPF 50 sunscreen.',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      }
    ];

    this.medicalReports = [
      {
        _id: '650000000000000000000041',
        patient: '650000000000000000000008',
        filename: 'lipid_panel_results_2026.pdf',
        originalName: 'Lipid_Panel_Report.pdf',
        mimeType: 'application/pdf',
        size: '1.2 MB',
        date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        path: '/uploads/lipid_panel_results_2026.pdf'
      },
      {
        _id: '650000000000000000000042',
        patient: '650000000000000000000008',
        filename: 'ecg_report_graph.png',
        originalName: 'Resting_ECG_Analysis.png',
        mimeType: 'image/png',
        size: '840 KB',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        path: '/uploads/ecg_report_graph.png'
      },
      {
        _id: '650000000000000000000043',
        patient: '650000000000000000000011', // Neha Sharma
        filename: 'cbc_blood_report_2026.pdf',
        originalName: 'Complete_Blood_Count_CBC_Panel.pdf',
        mimeType: 'application/pdf',
        size: '1.4 MB',
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        path: '/uploads/cbc_blood_report_2026.pdf'
      },
      {
        _id: '650000000000000000000044',
        patient: '650000000000000000000011', // Neha Sharma
        filename: 'dermatology_allergy_screening.pdf',
        originalName: 'Skin_Patch_Allergy_Test_Results.pdf',
        mimeType: 'application/pdf',
        size: '820 KB',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        path: '/uploads/dermatology_allergy_screening.pdf'
      }
    ];

    this.consultations = [
      {
        _id: '650000000000000000000051',
        patient: '650000000000000000000011', // Neha Sharma
        doctor: '650000000000000000000012', // Dr. Dikshant Sharma
        appointmentId: '650000000000000000000025',
        vitals: { bp: '120/80', pulse: '72', temp: '98.6°F', weight: '58 kg' },
        chiefComplaint: 'Skin dryness, mild itching on forearm',
        symptoms: 'Erythema, desquamation',
        medicalHistory: 'No major surgeries. Mild cosmetic sensitivities.',
        examinationNotes: 'Localized mild patch on right forearm.',
        diagnosis: 'Contact Dermatitis & Barrier Dysfunction',
        clinicalNotes: 'Avoid fragranced cleansers. Prescribed topical Desonide 0.05%.',
        advice: 'Apply sunscreen, drink plenty of water, use ceramide cream.',
        followUpDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        followUpReason: 'Barrier repair progress review',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      }
    ];

    this.followUps = [
      {
        _id: '650000000000000000000061',
        patient: '650000000000000000000011',
        doctor: '650000000000000000000012',
        followUpDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        reason: 'Dermatology Skin Barrier Healing Review',
        notes: 'Check for skin hydration and flare reduction.',
        status: 'scheduled',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        _id: '650000000000000000000062',
        patient: '650000000000000000000008',
        doctor: '650000000000000000000002',
        followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        reason: 'Blood Pressure & Lipid Profile Re-evaluation',
        notes: 'Review 3-week BP logs.',
        status: 'scheduled',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      }
    ];

    this.vaccinations = [
      {
        _id: '650000000000000000000071',
        patient: '650000000000000000000011',
        vaccineName: 'Hepatitis B Booster',
        dateAdministered: '2025-06-15',
        nextDueDate: '2026-10-15',
        status: 'Completed',
        notes: 'Dose 3 administered successfully.'
      },
      {
        _id: '650000000000000000000072',
        patient: '650000000000000000000011',
        vaccineName: 'Annual Influenza (Flu Shield)',
        dateAdministered: null,
        nextDueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'Upcoming',
        notes: 'Scheduled for autumn seasonal protection.'
      },
      {
        _id: '650000000000000000000073',
        patient: '650000000000000000000008',
        vaccineName: 'Tetanus Booster (Tdap)',
        dateAdministered: '2024-03-10',
        nextDueDate: '2034-03-10',
        status: 'Completed',
        notes: '10-year booster.'
      }
    ];

    this.growthRecords = [
      {
        _id: '650000000000000000000081',
        patient: '650000000000000000000011',
        height: 165,
        weight: 58,
        bmi: 21.3,
        date: '2026-08-01',
        notes: 'Normal physiological range'
      },
      {
        _id: '650000000000000000000082',
        patient: '650000000000000000000011',
        height: 165,
        weight: 57.5,
        bmi: 21.1,
        date: '2026-05-15',
        notes: 'Routine health check'
      }
    ];

    this.notifications = [
      {
        _id: '650000000000000000000091',
        user: '650000000000000000000011', // Neha Sharma
        title: 'Appointment Confirmed',
        message: 'Dr. Dikshant Sharma has accepted your appointment request for 10:30 AM.',
        type: 'appointment',
        isRead: false,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        _id: '650000000000000000000092',
        user: '650000000000000000000011', // Neha Sharma
        title: 'Digital Prescription Issued',
        message: 'Dr. Dikshant Sharma issued a digital prescription for Contact Dermatitis.',
        type: 'prescription',
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        _id: '650000000000000000000093',
        user: '650000000000000000000012', // Dr. Dikshant Sharma
        title: 'New Consultation Booking',
        message: 'Neha Sharma requested a Dermatology consultation.',
        type: 'appointment',
        isRead: false,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    ];

    this.chats = [
      {
        _id: '650000000000000000000101',
        sender: '650000000000000000000011', // Neha
        receiver: '650000000000000000000012', // Dr. Dikshant
        message: 'Hello Doctor, I have uploaded my skin patch test report. Should I continue the Desonide cream?',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
        isRead: true
      },
      {
        _id: '650000000000000000000102',
        sender: '650000000000000000000012', // Dr. Dikshant
        receiver: '650000000000000000000011', // Neha
        message: 'Hello Neha! Yes, please apply a thin layer twice daily for 14 days along with the ceramide lotion.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        isRead: false
      }
    ];
  }

  generateId() {
    return '65' + Math.random().toString(16).substring(2, 10).padEnd(8, '0') + Math.random().toString(16).substring(2, 16).padEnd(14, '0');
  }

  wrapUserDoc(raw) {
    if (!raw) return null;
    const doc = { ...raw };
    doc._id = String(raw._id);
    doc.id = String(raw._id);
    doc.comparePassword = async function (candidate) {
      return bcrypt.compare(candidate, raw.password);
    };
    doc.save = async function () {
      Object.assign(raw, doc, { updatedAt: new Date() });
      return doc;
    };
    return doc;
  }
}

const memoryStore = new MemoryStore();
module.exports = memoryStore;

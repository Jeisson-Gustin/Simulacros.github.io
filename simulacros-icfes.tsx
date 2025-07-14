import React, { useState, useRef } from 'react';
import { Upload, Download, Users, Settings, BarChart3, Lock, Unlock, Plus, Eye, Trash2, CheckCircle, XCircle, Calculator, PieChart, Target, BookOpen, Award, Clock } from 'lucide-react';

const SimulacrosICFES = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [simulacros, setSimulacros] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [currentView, setCurrentView] = useState('login');
  const [selectedSimulacro, setSelectedSimulacro] = useState(null);
  const [userForm, setUserForm] = useState({
    nombre: '',
    identificacion: '',
    institucion: '',
    grado: ''
  });
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [examStartTime, setExamStartTime] = useState(null);
  const fileInputRef = useRef(null);

  // Sample exam questions for demonstration
  const sampleQuestions = [
    {
      id: 1,
      question: "Si f(x) = 2x² + 3x - 1, ¿cuál es el valor de f(2)?",
      options: ["A) 13", "B) 11", "C) 9", "D) 7"],
      correct: "A"
    },
    {
      id: 2,
      question: "¿Cuál es la derivada de f(x) = x³ - 4x + 2?",
      options: ["A) 3x² - 4", "B) x² - 4x", "C) 3x² + 4", "D) 3x - 4"],
      correct: "A"
    },
    {
      id: 3,
      question: "Si log₂(x) = 3, entonces x es igual a:",
      options: ["A) 6", "B) 8", "C) 9", "D) 12"],
      correct: "B"
    }
  ];

  const handleAdminLogin = () => {
    if (adminPassword === 'admin123') {
      setIsAdmin(true);
      setCurrentView('admin');
    } else {
      alert('Contraseña administrativa incorrecta');
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/html') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newSimulacro = {
          id: Date.now(),
          nombre: file.name.replace('.html', ''),
          contenido: e.target.result,
          activo: false,
          fechaCreacion: new Date().toLocaleDateString(),
          participantes: 0
        };
        setSimulacros([...simulacros, newSimulacro]);
      };
      reader.readAsText(file);
    } else {
      alert('Por favor, seleccione un archivo HTML válido');
    }
  };

  const toggleSimulacroStatus = (id) => {
    setSimulacros(simulacros.map(s => 
      s.id === id ? { ...s, activo: !s.activo } : s
    ));
  };

  const deleteSimulacro = (id) => {
    setSimulacros(simulacros.filter(s => s.id !== id));
  };

  const generatePublicURL = (simulacro) => {
    const baseURL = window.location.origin;
    return `${baseURL}/simulacro/${simulacro.id}`;
  };

  const startExam = (simulacro) => {
    setSelectedSimulacro(simulacro);
    setCurrentQuestion(0);
    setUserAnswers({});
    setExamStartTime(new Date());
    setCurrentView('exam');
  };

  const handleAnswerSelect = (questionId, answer) => {
    setUserAnswers({
      ...userAnswers,
      [questionId]: answer
    });
  };

  const submitExam = () => {
    const endTime = new Date();
    const timeSpent = Math.round((endTime - examStartTime) / 1000 / 60); // minutes
    
    let correctAnswers = 0;
    sampleQuestions.forEach(q => {
      if (userAnswers[q.id] === q.correct) {
        correctAnswers++;
      }
    });

    const score = Math.round((correctAnswers / sampleQuestions.length) * 100);

    const newUser = {
      id: Date.now(),
      ...userForm,
      simulacroId: selectedSimulacro.id,
      simulacroNombre: selectedSimulacro.nombre,
      puntaje: score,
      respuestasCorrectas: correctAnswers,
      totalPreguntas: sampleQuestions.length,
      tiempoEmpleado: timeSpent,
      fechaExamen: new Date().toLocaleDateString(),
      respuestas: userAnswers
    };

    setUsuarios([...usuarios, newUser]);
    
    // Update simulacro participant count
    setSimulacros(simulacros.map(s => 
      s.id === selectedSimulacro.id 
        ? { ...s, participantes: s.participantes + 1 }
        : s
    ));

    setCurrentView('results');
  };

  const downloadResults = () => {
    const csvContent = [
      ['Nombre', 'Identificación', 'Institución', 'Grado', 'Simulacro', 'Puntaje', 'Respuestas Correctas', 'Total Preguntas', 'Tiempo (min)', 'Fecha'].join(','),
      ...usuarios.map(u => [
        u.nombre,
        u.identificacion,
        u.institucion,
        u.grado,
        u.simulacroNombre,
        u.puntaje,
        u.respuestasCorrectas,
        u.totalPreguntas,
        u.tiempoEmpleado,
        u.fechaExamen
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resultados_simulacros_icfes.csv';
    a.click();
  };

  // Mathematical decorative elements
  const MathDecoration = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5">
      <div className="absolute top-10 left-10 text-6xl font-bold text-red-500">∑</div>
      <div className="absolute top-20 right-20 text-4xl font-bold text-green-500">∫</div>
      <div className="absolute bottom-20 left-20 text-5xl font-bold text-red-500">π</div>
      <div className="absolute bottom-10 right-10 text-4xl font-bold text-green-500">√</div>
      <div className="absolute top-1/2 left-1/4 text-3xl font-bold text-red-400">∞</div>
      <div className="absolute top-1/3 right-1/3 text-4xl font-bold text-green-400">α</div>
    </div>
  );

  if (currentView === 'login') {
    return (
      <div className="min-h-screen bg-white relative">
        <MathDecoration />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
          <div className="bg-white border-2 border-gray-200 rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <Calculator className="text-red-500 mr-3" size={48} />
                <BookOpen className="text-green-500" size={48} />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Simulacros ICFES</h1>
              <p className="text-gray-600">Sistema de Evaluación Matemática</p>
            </div>

            <div className="space-y-4">
              <button 
                onClick={() => setCurrentView('student')}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-300 flex items-center justify-center"
              >
                <Target className="mr-2" size={20} />
                Realizar Simulacro
              </button>

              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 text-center">Acceso Administrativo</h3>
                <input
                  type="password"
                  placeholder="Contraseña de administrador"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-3 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                />
                <button 
                  onClick={handleAdminLogin}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center"
                >
                  <Settings className="mr-2" size={16} />
                  Acceder como Administrador
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'admin') {
    return (
      <div className="min-h-screen bg-white relative">
        <MathDecoration />
        
        {/* Header */}
        <div className="relative z-10 bg-red-500 text-white p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Settings className="mr-3" size={28} />
              <h1 className="text-2xl font-bold">Panel Administrativo - Simulacros ICFES</h1>
            </div>
            <button 
              onClick={() => setCurrentView('login')}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition duration-300"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        <div className="relative z-10 container mx-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Statistics Cards */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
              <div className="flex items-center">
                <BookOpen className="text-red-500 mr-3" size={24} />
                <div>
                  <p className="text-gray-600 text-sm">Simulacros Activos</p>
                  <p className="text-2xl font-bold text-gray-800">{simulacros.filter(s => s.activo).length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
              <div className="flex items-center">
                <Users className="text-green-500 mr-3" size={24} />
                <div>
                  <p className="text-gray-600 text-sm">Total Participantes</p>
                  <p className="text-2xl font-bold text-gray-800">{usuarios.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
              <div className="flex items-center">
                <BarChart3 className="text-red-500 mr-3" size={24} />
                <div>
                  <p className="text-gray-600 text-sm">Promedio General</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {usuarios.length > 0 ? Math.round(usuarios.reduce((acc, u) => acc + u.puntaje, 0) / usuarios.length) : 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Upload Section */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Upload className="mr-2 text-red-500" />
              Cargar Nuevo Simulacro
            </h2>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept=".html"
                onChange={handleFileUpload}
                ref={fileInputRef}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current.click()}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition duration-300 flex items-center"
              >
                <Plus className="mr-2" size={20} />
                Seleccionar Archivo HTML
              </button>
              <p className="text-gray-600">Solo archivos .html permitidos</p>
            </div>
          </div>

          {/* Simulacros List */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-lg mb-8">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <BookOpen className="mr-2 text-green-500" />
                Simulacros Disponibles
              </h2>
            </div>
            <div className="p-6">
              {simulacros.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No hay simulacros cargados</p>
              ) : (
                <div className="space-y-4">
                  {simulacros.map((simulacro) => (
                    <div key={simulacro.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">{simulacro.nombre}</h3>
                          <p className="text-sm text-gray-600">
                            Creado: {simulacro.fechaCreacion} | Participantes: {simulacro.participantes}
                          </p>
                          <p className="text-sm font-medium mt-1">
                            Estado: <span className={simulacro.activo ? 'text-green-600' : 'text-red-600'}>
                              {simulacro.activo ? 'Activo' : 'Inactivo'}
                            </span>
                          </p>
                          {simulacro.activo && (
                            <div className="mt-2 p-3 bg-gray-50 rounded border">
                              <p className="text-sm font-medium text-gray-700">URL Pública:</p>
                              <code className="text-xs text-blue-600 break-all">
                                {generatePublicURL(simulacro)}
                              </code>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => toggleSimulacroStatus(simulacro.id)}
                            className={`p-2 rounded-lg transition duration-300 ${
                              simulacro.activo 
                                ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                                : 'bg-green-100 text-green-600 hover:bg-green-200'
                            }`}
                            title={simulacro.activo ? 'Desactivar' : 'Activar'}
                          >
                            {simulacro.activo ? <Lock size={16} /> : <Unlock size={16} />}
                          </button>
                          <button
                            onClick={() => deleteSimulacro(simulacro.id)}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition duration-300"
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Results Section */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-lg">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <BarChart3 className="mr-2 text-red-500" />
                Resultados de Participantes
              </h2>
              {usuarios.length > 0 && (
                <button
                  onClick={downloadResults}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition duration-300 flex items-center"
                >
                  <Download className="mr-2" size={16} />
                  Descargar CSV
                </button>
              )}
            </div>
            <div className="p-6">
              {usuarios.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No hay resultados registrados</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-4 font-semibold text-gray-700">Nombre</th>
                        <th className="text-left py-2 px-4 font-semibold text-gray-700">Institución</th>
                        <th className="text-left py-2 px-4 font-semibold text-gray-700">Simulacro</th>
                        <th className="text-center py-2 px-4 font-semibold text-gray-700">Puntaje</th>
                        <th className="text-center py-2 px-4 font-semibold text-gray-700">Tiempo</th>
                        <th className="text-center py-2 px-4 font-semibold text-gray-700">Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usuarios.map((usuario) => (
                        <tr key={usuario.id} className="border-b border-gray-100">
                          <td className="py-3 px-4">{usuario.nombre}</td>
                          <td className="py-3 px-4">{usuario.institucion}</td>
                          <td className="py-3 px-4">{usuario.simulacroNombre}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              usuario.puntaje >= 70 ? 'bg-green-100 text-green-800' : 
                              usuario.puntaje >= 50 ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'
                            }`}>
                              {usuario.puntaje}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">{usuario.tiempoEmpleado} min</td>
                          <td className="py-3 px-4 text-center">{usuario.fechaExamen}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'student') {
    const activeSimulacros = simulacros.filter(s => s.activo);
    
    return (
      <div className="min-h-screen bg-white relative">
        <MathDecoration />
        
        <div className="relative z-10 bg-green-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Target className="mr-3" size={28} />
              <h1 className="text-2xl font-bold">Simulacros ICFES - Matemáticas</h1>
            </div>
            <button 
              onClick={() => setCurrentView('login')}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition duration-300"
            >
              Volver al Inicio
            </button>
          </div>
        </div>

        <div className="relative z-10 container mx-auto p-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Registro de Participante</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    value={userForm.nombre}
                    onChange={(e) => setUserForm({...userForm, nombre: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Ingrese su nombre completo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Número de Identificación</label>
                  <input
                    type="text"
                    required
                    value={userForm.identificacion}
                    onChange={(e) => setUserForm({...userForm, identificacion: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Número de documento"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Institución Educativa</label>
                  <input
                    type="text"
                    required
                    value={userForm.institucion}
                    onChange={(e) => setUserForm({...userForm, institucion: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Nombre de su institución"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Grado</label>
                  <select
                    required
                    value={userForm.grado}
                    onChange={(e) => setUserForm({...userForm, grado: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Seleccione su grado</option>
                    <option value="9">Noveno</option>
                    <option value="10">Décimo</option>
                    <option value="11">Once</option>
                    <option value="universitario">Universitario</option>
                  </select>
                </div>

                {activeSimulacros.length > 0 ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800 font-medium">Simulacro Disponible:</p>
                    <p className="text-green-700">{activeSimulacros[0].nombre}</p>
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 font-medium">No hay simulacros activos en este momento</p>
                  </div>
                )}

                <button
                  type="button"
                  disabled={activeSimulacros.length === 0}
                  onClick={() => {
                    if (activeSimulacros.length > 0 && userForm.nombre && userForm.identificacion && userForm.institucion && userForm.grado) {
                      startExam(activeSimulacros[0]);
                    } else if (activeSimulacros.length === 0) {
                      alert('No hay simulacros activos disponibles');
                    } else {
                      alert('Por favor complete todos los campos');
                    }
                  }}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition duration-300 ${
                    activeSimulacros.length > 0
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Clock className="inline mr-2" size={20} />
                  Iniciar Simulacro
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'exam') {
    const currentQ = sampleQuestions[currentQuestion];
    const isLastQuestion = currentQuestion === sampleQuestions.length - 1;
    
    return (
      <div className="min-h-screen bg-white relative">
        <MathDecoration />
        
        <div className="relative z-10 bg-blue-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <BookOpen className="mr-3" size={28} />
              <h1 className="text-2xl font-bold">{selectedSimulacro.nombre}</h1>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">Pregunta {currentQuestion + 1} de {sampleQuestions.length}</p>
              <p className="text-sm opacity-90">Estudiante: {userForm.nombre}</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 container mx-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-8">
              <div className="mb-6">
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestion + 1) / sampleQuestions.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-6">
                  {currentQuestion + 1}. {currentQ.question}
                </h2>

                <div className="space-y-3">
                  {currentQ.options.map((option, index) => (
                    <label 
                      key={index}
                      className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition duration-300"
                    >
                      <input
                        type="radio"
                        name={`question_${currentQ.id}`}
                        value={option.charAt(0)}
                        checked={userAnswers[currentQ.id] === option.charAt(0)}
                        onChange={(e) => handleAnswerSelect(currentQ.id, e.target.value)}
                        className="mr-3 text-blue-500"
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                  disabled={currentQuestion === 0}
                  className={`px-6 py-3 rounded-lg font-semibold transition duration-300 ${
                    currentQuestion === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-500 hover:bg-gray-600 text-white'
                  }`}
                >
                  Anterior
                </button>

                {isLastQuestion ? (
                  <button
                    onClick={submitExam}
                    className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg font-semibold transition duration-300"
                  >
                    Finalizar Examen
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentQuestion(currentQuestion + 1)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition duration-300"
                  >
                    Siguiente
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'results') {
    const userResult = usuarios[usuarios.length - 1];
    const percentage = userResult.puntaje;
    
    return (
      <div className="min-h-screen bg-white relative">
        <MathDecoration />
        
        <div className="relative z-10 container mx-auto p-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-8 text-center">
              <div className="mb-6">
                {percentage >= 70 ? (
                  <Award className="mx-auto text-green-500 mb-4" size={64} />
                ) : percentage >= 50 ? (
                  <Target className="mx-auto text-yellow-500 mb-4" size={64} />
                ) : (
                  <XCircle className="mx-auto text-red-500 mb-4" size={64} />
                )}
              </div>

              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                Examen Completado
              </h1>

              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="text-6xl font-bold mb-2" style={{
                  color: percentage >= 70 ? '#10b981' : percentage >= 50 ? '#f59e0b' : '#ef4444'
                }}>
                  {percentage}%
                </div>
                <p className="text-gray-600">
                  {userResult.respuestasCorrectas} de {userResult.totalPreguntas} preguntas correctas
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Tiempo empleado: {userResult.tiempoEmpleado} minutos
                </p>
              </div>

              <div className="text-left bg-blue-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-800 mb-2">Información del Participante:</h3>
                <p className="text-blue-700"><strong>Nombre:</strong> {userResult.nombre}</p>
                <p className="text-blue-700"><strong>Institución:</strong> {userResult.institucion}</p>
                <p className="text-blue-700"><strong>Grado:</strong> {userResult.grado}</p>
                <p className="text-blue-700"><strong>Fecha:</strong> {userResult.fechaExamen}</p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setCurrentView('student');
                    setUserForm({nombre: '', identificacion: '', institucion: '', grado: ''});
                  }}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg font-semibold transition duration-300"
                >
                  Realizar Otro Simulacro
                </button>
                
                <button
                  onClick={() => setCurrentView('login')}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold transition duration-300"
                >
                  Volver al Inicio
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default SimulacrosICFES;
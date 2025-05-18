camino-a-casa-app:
  name: "Camino a Casa – App Móvil (Frontend)"
  description: >
    Aplicación móvil desarrollada con React Native para conectar adoptantes con mascotas disponibles.
  stack:
    - React Native (Expo)
    - Axios
    - React Navigation
    - Firebase (futuro)
    - Tailwind via NativeWind (opcional)
  structure:
    - assets/
    - components/
    - screens/
    - services/
    - App.js
    - app.json
  setup:
    steps:
      - git clone https://github.com/ivancancan/camino-a-casa-app.git
      - cd camino-a-casa-app
      - npm install
      - npx expo start
  roadmap:
    - [x] Pantalla de registro / login
    - [ ] Swipe de mascotas
    - [ ] Chat entre adoptante y publicador
    - [ ] Sistema de seguimiento post-adopción
    - [ ] Notificaciones push
  meta: >
    Diseñar una experiencia accesible, confiable y rápida para usuarios con cualquier tipo de dispositivo móvil, con enfoque en escalabilidad y adopciones responsables.

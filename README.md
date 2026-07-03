# Nutrient Tracker

Una aplicación web para rastrear el consumo diario de nutrientes de manera semanal. Permite a los usuarios marcar porciones de diferentes categorías de nutrientes para cada día de la semana y configurar límites personalizados.

## Características Principales

- **Entrada de Datos**: Marca el número de porciones para cada categoría de nutrientes (Agua, Azúcar, Carbohidratos, Proteína, Fruta, Grasa y Vegetales) por día de la semana.
- **Vista Tabular Semanal**: Muestra los datos de nutrientes en formato de tabla, con columnas para los días de la semana y filas para las categorías.
- **Configuración de Límites**: Permite ingresar el número máximo de porciones para cada categoría en los encabezados de fila.
- **Almacenamiento de Sesión**: Guarda la información de porciones durante la sesión del usuario.
- **Interfaz Intuitiva**: Diseño limpio con íconos para cada categoría y transiciones suaves.
- **PWA**: Aplicación web progresiva que se puede instalar como app nativa.

## Tecnologías Utilizadas

- **Next.js**: Framework de React para aplicaciones web.
- **TypeScript**: Tipado estático para JavaScript.
- **Tailwind CSS**: Framework de CSS para estilos.
- **Radix UI**: Componentes de UI accesibles.
- **Firebase**: Backend y hosting.
- **Genkit AI**: Integración de IA para funcionalidades avanzadas.
- **PWA**: Configuración para aplicación web progresiva.

## Guías de Estilo

- **Color Primario**: Verde suave (#90EE90) para representar salud y nutrición.
- **Color de Fondo**: Gris claro (#F0F0F0) para un fondo limpio y neutral.
- **Color de Acento**: Amarillo claro (#FCE883) para resaltar totales.
- **Fuente**: 'PT Sans' para un estilo moderno y legible.
- **Diseño**: Layout tabular claro con columnas y filas distintas para entrada y visualización fácil de datos.

## Instalación

1. Clona el repositorio:
   ```bash
   git clone <url-del-repositorio>
   cd NutrientTracker
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Configura las variables de entorno (si es necesario, revisa `.env` o documentación de Firebase/Genkit).

4. Ejecuta en modo desarrollo:
   ```bash
   npm run dev
   ```

5. Para desarrollo con Genkit AI:
   ```bash
   npm run genkit:dev
   ```

## Uso

- Abre la aplicación en tu navegador (por defecto en `http://localhost:9002`).
- Usa las pestañas para alternar entre "Rastreador" y "Configuración".
- En el rastreador, marca las porciones para cada día y categoría.
- En configuración, ajusta los límites máximos de porciones.
- Los datos se guardan automáticamente en la sesión del navegador.

## Construcción y Despliegue

Para construir la aplicación para producción:
```bash
npm run build
```

Para iniciar en modo producción:
```bash
npm start
```

La aplicación está configurada para desplegarse en Firebase Hosting.

## Contribución

1. Fork el proyecto.
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`).
3. Commit tus cambios (`git commit -am 'Agrega nueva funcionalidad'`).
4. Push a la rama (`git push origin feature/nueva-funcionalidad`).
5. Abre un Pull Request.

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

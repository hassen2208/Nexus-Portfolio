/** World units are approximately metres; coordinate system Y up, negative Z toward laboratories. */
export const STATIONS = [
  { id: 'systems', number: '01', name: 'Systems & Architecture', shortName: 'Systems', persona: 'THE BUILDER', accent: '#64e3f8', position: [-9,0,-7], readiness: 'interactive', backlog: ['NEX-008','NEX-009','NEX-010','NEX-011'] },
  { id: 'data', number: '02', name: 'Data & Analytics', shortName: 'Data', persona: 'THE ANALYST', accent: '#ab9cf5', position: [0,0,-14], readiness: 'environment + prototype', backlog: ['NEX-012'] },
  { id: 'projects', number: '03', name: 'Projects & Operations', shortName: 'Projects', persona: 'THE OPERATOR', accent: '#f0b579', position: [9,0,-7], readiness: 'environment + prototype', backlog: ['NEX-013','NEX-015'] },
];
export const SYSTEM_NODES = [
  {id:'client',order:'01',label:'Client / UI',responsibility:'Web interface, user input and feedback.',technologies:['React','JavaScript']},
  {id:'api',order:'02',label:'API',responsibility:'Endpoints, request validation and routing.',technologies:['FastAPI','Python']},
  {id:'service',order:'03',label:'Services',responsibility:'Business rules, orchestration and testability.',technologies:['Python','Docker']},
  {id:'database',order:'04',label:'Database',responsibility:'Relational storage, queries and integrity.',technologies:['PostgreSQL','SQL']},
];
export const PLAYER_SPAWN = [-2.4,0,4.5];
export const WALK_SPEED = 3.5;
export const RUN_SPEED = 5.2;
export const WORLD_BOUNDS = {minX:-13.2,maxX:13.2,minZ:-18.3,maxZ:10.1};

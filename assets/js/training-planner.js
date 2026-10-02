(function () {
  var form = document.getElementById('training-plan-form');
  if (!form) return;

  var focusInput = document.getElementById('training-focus');
  var aircraftInput = document.getElementById('training-aircraft');
  var session = document.getElementById('training-session');
  var taskList = document.getElementById('training-task-list');
  var progressBar = document.getElementById('training-progress');
  var progressFill = document.getElementById('training-progress-fill');
  var progressText = document.getElementById('training-progress-text');
  var debriefInput = document.getElementById('training-debrief-notes');
  var assessment = document.getElementById('training-assessment');
  var assessmentStatus = document.getElementById('training-assessment-status');
  var evaluatedSession = null;

  var trainingFocuses = {
    handling: {
      title: 'Aircraft handling',
      setup: 'Choose a clear practice area and review the selected aircraft\'s normal operating procedures.',
      standard: 'Maintain control through each maneuver and return for a stable landing.',
      tasks: [
        'Complete the aircraft\'s normal preflight and start-up checklist.',
        'Practice coordinated turns, climbs, and descents.',
        'Stabilize in cruise and make small control corrections.',
        'Fly a visual pattern and complete a controlled landing.',
        'Debrief one handling habit to repeat or improve.'
      ]
    },
    navigation: {
      title: 'Waypoint navigation',
      setup: 'Pick a familiar map, set a departure and destination, and add two intermediate waypoints.',
      standard: 'Reach the planned waypoints, manage any route deviation, and return to base.',
      tasks: [
        'Set up the route and review the aircraft navigation references.',
        'Depart and establish the planned course.',
        'Cross-check position using the available navigation sources.',
        'Identify the destination and navigate back to base.',
        'Record one route deviation or navigation error for the debrief.'
      ]
    },
    formation: {
      title: 'Formation flying',
      setup: 'Agree on lead, wing positions, route, and rejoin plan before departure.',
      standard: 'Maintain visual contact, communicate position changes, and complete a safe rejoin.',
      tasks: [
        'Brief the formation, roles, route, and lost-sight procedure.',
        'Join on the lead aircraft and confirm your position.',
        'Hold station through straight flight and turns.',
        'Practice a rejoin after a planned separation.',
        'Debrief spacing, communication, and visual scan.'
      ]
    },
    'air-to-air': {
      title: 'Air-to-air intercept',
      setup: 'Use a training mission or server with clear identification and engagement rules.',
      standard: 'Maintain a clear tactical picture, communicate decisions, and recover safely.',
      tasks: [
        'Review the mission rules, intercept roles, and communications plan.',
        'Build situational awareness using available aircraft sensors.',
        'Practice sorting and communicating the contact picture.',
        'Fly an intercept, then disengage or terminate as briefed.',
        'Rejoin or recover and debrief one decision point.'
      ]
    },
    'air-to-ground': {
      title: 'Air-to-ground attack',
      setup: 'Choose a training range and target; review the selected weapon and aircraft references.',
      standard: 'Complete the briefed attack and egress while maintaining aircraft and mission awareness.',
      tasks: [
        'Brief the target, attack direction, roles, and egress route.',
        'Configure the aircraft and weapon using the module reference.',
        'Fly the planned ingress and confirm the target.',
        'Execute the practice attack and follow the planned egress.',
        'Assess the result and debrief delivery and recovery.'
      ]
    },
    communications: {
      title: 'Radio communications',
      setup: 'Select a mission with ATC, GCI, AWACS, or a wingman to talk to.',
      standard: 'Use clear calls, correct readbacks, and concise position or intent updates.',
      tasks: [
        'Set radios and review the calls needed for the sortie.',
        'Make an initial check-in and pass aircraft identification.',
        'Request and read back instructions clearly.',
        'Call significant position changes and mission transitions.',
        'Debrief one call to make shorter or clearer.'
      ]
    },
    procedures: {
      title: 'Start-up and recovery',
      setup: 'Use the aircraft checklist and choose a quiet airfield or training mission.',
      standard: 'Complete the planned ground-to-air-to-ground sequence using the aircraft reference.',
      tasks: [
        'Review the aircraft checklist before starting.',
        'Complete start-up and confirm the aircraft is ready to taxi.',
        'Taxi and communicate as required by the mission.',
        'Take off, fly a local circuit, and return to the field.',
        'Land, secure the aircraft, and note any checklist gaps.'
      ]
    }
  };

  try {
    localStorage.removeItem('jisw-training-planner-v1');
    localStorage.removeItem('jisw-training-planner-v2');
  } catch (error) {}

  function clearAssessment() {
    assessment.hidden = true;
    evaluatedSession = null;
    assessmentStatus.textContent = 'This assessment is not saved automatically. Download a copy to keep it.';
  }

  function renderAssessmentList(list, tasks, completed) {
    list.replaceChildren();
    if (!tasks.length) {
      var emptyItem = document.createElement('li');
      emptyItem.textContent = completed ? 'No tasks marked complete.' : 'No tasks to repeat.';
      list.appendChild(emptyItem);
      return;
    }

    tasks.forEach(function (task) {
      var item = document.createElement('li');
      item.textContent = task;
      list.appendChild(item);
    });
  }

  function evaluateSession() {
    var focus = trainingFocuses[focusInput.value];
    var taskInputs = Array.from(taskList.querySelectorAll('input[type="checkbox"]'));
    var completed = [];
    var repeat = [];

    taskInputs.forEach(function (input) {
      var task = input.parentElement.querySelector('span').textContent;
      (input.checked ? completed : repeat).push(task);
    });

    var isComplete = repeat.length === 0;
    var result = isComplete ? 'Completed' : 'Repeat';
    var date = new Date();
    evaluatedSession = {
      aircraft: aircraftInput.value,
      focus: focus.title,
      standard: focus.standard,
      result: result,
      completed: completed,
      repeat: repeat,
      notes: debriefInput.value.trim(),
      date: date
    };

    document.getElementById('training-assessment-title').textContent = focus.title;
    document.getElementById('training-assessment-summary').textContent = completed.length + ' of ' + taskInputs.length + ' practice criteria completed.';
    document.getElementById('training-assessment-result').textContent = result;
    renderAssessmentList(document.getElementById('training-completed-list'), completed, true);
    renderAssessmentList(document.getElementById('training-repeat-list'), repeat, false);
    assessment.classList.toggle('is-complete', isComplete);
    assessment.hidden = false;
    assessmentStatus.textContent = 'This assessment is not saved automatically. Download a copy to keep it.';
  }

  function buildAssessmentMarkdown(result) {
    var completedTasks = result.completed.length
      ? result.completed.map(function (task) { return '- [x] ' + task; }).join('\n')
      : '- None';
    var repeatTasks = result.repeat.length
      ? result.repeat.map(function (task) { return '- [ ] ' + task; }).join('\n')
      : '- None';
    var notes = result.notes || 'No debrief notes added.';

    return [
      '# J&I Flight Training Assessment',
      '',
      '- Date: ' + result.date.toLocaleString(),
      '- Aircraft: ' + result.aircraft,
      '- Training focus: ' + result.focus,
      '- Result: **' + result.result + '** (' + result.completed.length + '/' + (result.completed.length + result.repeat.length) + ' criteria completed)',
      '',
      '## Completion standard',
      result.standard,
      '',
      '## Completed',
      completedTasks,
      '',
      '## Repeat',
      repeatTasks,
      '',
      '## Debrief notes',
      notes,
      ''
    ].join('\n');
  }

  function downloadAssessment() {
    if (!evaluatedSession) return;
    var report = buildAssessmentMarkdown(evaluatedSession);
    var aircraftSlug = evaluatedSession.aircraft.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    var dateSlug = evaluatedSession.date.toISOString().slice(0, 10);
    var blob = new Blob([report], { type: 'text/markdown;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = 'training-assessment-' + dateSlug + '-' + aircraftSlug + '.md';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    assessmentStatus.textContent = 'Assessment downloaded.';
  }

  function updateProgress() {
    var taskInputs = Array.from(taskList.querySelectorAll('input[type="checkbox"]'));
    var completedCount = taskInputs.filter(function (input) { return input.checked; }).length;
    var percentage = taskInputs.length ? Math.round(completedCount / taskInputs.length * 100) : 0;
    progressText.textContent = completedCount + ' / ' + taskInputs.length;
    progressBar.setAttribute('aria-valuenow', String(percentage));
    progressFill.style.width = percentage + '%';
    session.classList.toggle('is-complete', percentage === 100 && taskInputs.length > 0);
  }

  function renderSession(state) {
    var focus = trainingFocuses[state.focus];
    if (!focus) return;
    var tasks = focus.tasks;

    aircraftInput.value = state.aircraft;
    focusInput.value = state.focus;
    document.getElementById('training-session-title').textContent = focus.title;
    document.getElementById('training-session-aircraft').textContent = state.aircraft;
    document.getElementById('training-session-setup').textContent = focus.setup;
    document.getElementById('training-session-standard').textContent = focus.standard;
    debriefInput.value = state.notes || '';
    taskList.replaceChildren();
    clearAssessment();

    tasks.forEach(function (task) {
      var item = document.createElement('li');
      var label = document.createElement('label');
      var checkbox = document.createElement('input');
      var text = document.createElement('span');
      checkbox.type = 'checkbox';
      text.textContent = task;
      label.appendChild(checkbox);
      label.appendChild(text);
      item.appendChild(label);
      taskList.appendChild(item);
      checkbox.addEventListener('change', function () {
        updateProgress();
        clearAssessment();
      });
    });

    session.hidden = false;
    updateProgress();
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    renderSession({
      aircraft: aircraftInput.value,
      focus: focusInput.value,
      notes: ''
    });
  });

  debriefInput.addEventListener('input', clearAssessment);
  document.getElementById('training-evaluate').addEventListener('click', evaluateSession);
  document.getElementById('training-download-assessment').addEventListener('click', downloadAssessment);

  document.getElementById('training-reset').addEventListener('click', function () {
    taskList.querySelectorAll('input[type="checkbox"]').forEach(function (input) {
      input.checked = false;
    });
    debriefInput.value = '';
    updateProgress();
    clearAssessment();
  });

  renderSession({
    aircraft: aircraftInput.value,
    focus: focusInput.value,
    notes: ''
  });
})();
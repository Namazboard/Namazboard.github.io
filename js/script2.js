






// [Функции-таймеры]
// Функция, вызываемая ежесекундно...
function SecHandler() {
	const t = new Date(); // Получили текущее время

	time.innerHTML = // Обновляем время
		Lzero(t.getHours()) + ":" + // Часы
		Lzero(t.getMinutes()) + ":" + // Минуты
		Lzero(t.getSeconds()); // Секунды

	// Раз в минуту...
	if(t.getSeconds() == 0) {TimesHandler(t);} // Oбновляем оставшееся время

	setTimeout(SecHandler, 1000 - t.getMilliseconds()); // Запланировали следующее срабатывание
}


// Функция-обработчик обратного отсчета до намаза. Ежеминутная
async function TimesHandler(t) {
	const fail = NamNames.every((namaz, i) => { // Перебираем все намазы
		let h = TimesList[t.getDate()-1][namaz[1]][0] - t.getHours(); // Оставшиеся часы
		let m = TimesList[t.getDate()-1][namaz[1]][1] - t.getMinutes(); // Оставшиеся минуты
		if(m < 0) {m += 60; h--;} // Подправим минуты, если нужно

		if(h > 0) { // Если часы полож.
			time_last.innerHTML = `До ${namaz[0]} ${h}ч. ${m ? `${m}мин.` : ""}`; // Выведем часы и минуты, если есть
			return false; // Вернем false, чтоб выйти из цикла
		} else if(h == 0) { // Если же часы = 0
			if(m > 0) {time_last.innerHTML = `До ${namaz[0]} ${m}мин.`;} // То, если есть миинуты, выведем только их
			else { // Если же нет, тоооо...
				time_last.innerHTML = `Время ${namaz[0]} зашло.`; // Пишем, что намаз зашел
				switch(i) { // Смотрим, какой намаз
				case 0: // Фаджр
					SetTheme(1); // Меняем тему
					break;
				case 3: // Магриб
					SetTheme(0); // Меняем тему
					break;
				default: // Остальные...
					NamNotify(); // Уведомление
					break;
				}
			}
			return false; // Вернем false, чтоб выйти из цикла
		} else {
			return true; // Если же часы < 0, то идем дальше
		}

	});
	if(fail) { // Если намазы кончились
		if(DayNow == t.getDate()) { // То, если мы еще не сменили день
			t.setDate(t.getDate() + 1); // То сменим
			await DaySet(t); // И обновим дату с временами
		}
		let h = TimesList[t.getDate()-1][NamNames[0][1]][0] - t.getHours() + 24; // Оставшиеся часы
		let m = TimesList[t.getDate()-1][NamNames[0][1]][1] - t.getMinutes(); // Оставшиеся минуты
		if(m < 0) {m += 60; h--;} // Подправим минуты, если нужно
		time_last.innerHTML = `До ${NamNames[0][0]}${h ? ` ${h}ч.` : ""}${m ? ` ${m}мин.` : ""}`;
	}
}





// [Функции-инструменты]
// Функция, меняющая дату и времена
async function DaySet(t) { // Принимает смещение в днях
	date.innerHTML = t.getDate() + " " + Months[t.getMonth()]; // Обновили дату
	weekday.innerHTML = WeekDays[t.getDay()]; // Обновили день недели

	await TimesParse(t) // Обновили список времен
	TimesFill(TimesList[t.getDate()-1]); // Обновили времена намазов

	DayNow = t.getDate();
}


// Функция заполнения времен намазов
function TimesFill(times) {
	if(times) {
		nam_times.forEach((nam, i) => nam.innerHTML = Lzero(times[i][0]) + ":" + Lzero(times[i][1])) // Выводим время каждого намаза
	} else {
		nam_times.forEach(nam => nam.innerHTML = "") // Заполням пустышками
	}
}


// Функция добавления вудущего нуля при надобности (1 => 01, 02 => 02)
function Lzero(num) {
	num = num.toString(); // Преобразуем в строку, если это число
	return num.length < 2 ? '0' + num : num; // Если длина меньше 2, прибавляем впереди нолик
}


// Функция парсинга времен
async function TimesParse(t) {
	if(TimesM != t.getMonth()) { // Если месяц не тот, что записан у нас
		await fetch(`${TimesFolder}/${Lzero(t.getMonth() + 1)}_${t.getFullYear()}.txt`) // Запрашиваем файл времен
		.then(times => times.text()) // В случае успеха достаём из ответа текст
		.then(times => times.split(DaySplit)) // Далее разделяем времена по дням
		.then(times => {
			times.forEach((day, i) => // Перебираем каждый день
				{	
					times[i] = day.split(NamSplit); // И делим намазы друг от друга
					times[i].forEach((namaz, j) => times[i][j] = namaz.split(TimeSplit)); // И в каждом намазе делим часы и минуты
				})
			return times; // Возвращаем времена для следующего шага
			})
		.then(times => {TimesList = times; TimesM = t.getMonth()}) // Записываем результаты
		.catch(() => { // Ну а в случае ошибки...
			TimesList = undefined; // Записываем пустышку
			TimesM = undefined; // И месяц тож

			TimeLast.innerHTML = "Времена не найдены!" // Пишем предупреждение внизу
			TimesFill();
			throw "Times not found!"; // И выходим из функции
		});
	}
}






// Запуск всех таймеров
await DaySet(new Date);
SecHandler(); // Запуск секундного таймера
TimesHandler(new Date); // И, запустим отчет до намаза (не будем же мы ждать до конца минуты)))
SetTheme(1);
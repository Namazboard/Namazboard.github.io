// [DOM - элементы]
const date = document.getElementById('Date'); // Дата
const weekday = document.getElementById('Weekday'); // День недели
const time = document.getElementById('Time'); // Время
const nam_times = Array.from(document.getElementsByClassName('NamTime')); // Времена намазов (Теперь это массив)
const time_last = document.getElementById('TimeLast'); // Время до ближайшего намаза
const tablet = document.getElementById('tablet'); // Контейнер-табличка (Нужен для графических фишек)
const body = document.querySelector("body"); // Главный контейнер (Нужен для графических фишек)



// [CSS - свойства]
const BodyShadow = "0px 0px 250px 250px rgba(0, 255, 0, 0.7) inset"; // Тень body для уведомления

// Темы
const DayBackground = "url(img/background-day.jpg)"; // Дневной фон
const DayTabletColor = "rgba(255, 255, 255, 0.7)"; // Цвет таблички днем
const DayFontColor = "black"; // Цвет текста днем

const NightBackground = "url(img/background-night.jpg)"; // Ночной фон
const NightTabletColor = "rgba(0, 0, 0, 0.7)"; // Цвет таблички ночью
const NightFontColor = "white"; // Цвет текста ночью



// [Константы]
// Названия месяцев
const Months = [
		"Января", "Февраля", "Марта",
		"Апреля", "Мая", "Июня",
		"Июля", "Августа", "Сентября",
		"Октября", "Ноября", "Декабря"
	];


// Названия дней недели
const WeekDays = [
		"Воскресенье", "Понедельник",
		"Вторник", "Среда", "Четверг",
		"Пятница", "Суббота"
	];


// Названия намазов и их номера в списках времен для оставшегося времени
const NamNames = [
		["Фаджра", 1],
		["Зухра", 4],
		["'Асра", 5],
		["Магриба", 6],
		["'Иша", 7],
	];


// Данные для парсинга времен
const TimesFolder = "times"; // Папка с временами (В одной папке с index.html)
const DaySplit = "\n"; // Разделитель дней в файле
const NamSplit = " "; // Разделитель намазов
const TimeSplit = ":"; // Разделитель часов от минут





// [Глобальные переменные]
// Хранилище запарсенных времен
let TimesList; // Времена намазов
let TimesM; // Запарсенный месяц



// [Функция-таймер]
// Функция, вызываемая ежесекундно...
function SecHandler() {
	const t = new Date(); // Получили текущее время

	time.innerHTML = // Обновляем время
		Lzero(t.getHours()) + ":" + // Часы
		Lzero(t.getMinutes()) + ":" + // Минуты
		Lzero(t.getSeconds()); // Секунды

	setTimeout(SecHandler, 1000 - t.getMilliseconds()); // Запланировали следующее срабатывание
}


// Отчет до ближайшего намаза (раз в минуту)
function LastTimer(times) {
	const t = new Date(); // Получили текущее время

	let h = t.getHours(); // Достаем часы
	let m = t.getMinutes(); // Достаем минуты

	for(let nam of NamNames) { // Перебираем намазы (ищем след. намаз)

		let lh = times[nam[1]][0] - h; // Нашли оставшиеся до намаза часы...
		let lm = times[nam[1]][1] - m; // И минуты)

		if(lm < 0) {lm += 60; lh--;} // Поправим минуты, если нужно

		if(lh > 0) { // Если часы больше нуля
			if(lm > 0) { // То, если минуты намаза есть
				time_last.innerHTML = `До ${nam[0]} ${times[nam[1]][0]}ч ${times[nam[1]][1]}мин`; // Выводим полное сообщение
			} else { // Если же минут нет
 				time_last.innerHTML = `До ${nam[0]} ${times[nam[1]][0]}ч`; // Выводим чисто часы
			}
		} else if(lh == 0) { // Если же часы нулевые
			if(lm > 0) { // То, если минуты намаза есть
				time_last.innerHTML = `До ${nam[0]} ${times[nam[1]][1]}мин`; // Выводим чисто минуты
			} else { // Если же минут нет => время зашло => ...
				time_last.innerHTML = `Время ${nam[0]} зашло`; // Пишем, что время зашло
				switch(nam[1]) { // Смотрим, какой намаз
				case 0: // Фаджр
					SetTheme(1); // Меняем тему на дневную
					break;
				case 3:
					SetTheme(0); // Меняем тему на ночную
					break;
				case 4:
					NamNotify(); // Уведомление
					t.setDate(t.getDate() + 1);
					DaySet(t);
					return;
				default:
					NamNotify();
				}
			}
		}
	}
}



// [Функции графики]
// Функция смены тем
function SetTheme(theme) { // Принимает тему (0/faslse/undefined -> ночная, остальное -> дневная)
	if(theme) { // Если тема дневная
		body.style["background-image"] = DayBackground; // Фон
		tablet.style["background"] = DayTabletColor; // Фон таблички
		body.style["color"] = DayFontColor; // Цвет текста
	} else {
		body.style["background-image"] = NightBackground; // Фон
		tablet.style["background"] = NightTabletColor; // Фон таблички
		body.style["color"] = NightFontColor; // Цвет текста
	}
}


// Функция уведомления о зашедшем намазе
function NamNotify(shadow = BodyShadow) { // Принимает тень, по умолчанию данная ввреху
	body.style["box-shadow"] = shadow; // Ставим уведомляющую тень
	body.ontransitionend = () => body.style["box-shadow"] = "none"; // Когда анимация появления прошла, убираем тень
}



// [Функции-инструменты]
// Функция, меняющая дату и времена
async function DaySet(t) { // Принимает смещение в днях
	date.innerHTML = t.getDate() + " " + Months[t.getMonth()]; // Обновили дату
	weekday.innerHTML = WeekDays[t.getDay()]; // Обновили день недели

	let dayTimes = await TimesParse(t) // Пишем времена на день в переменную
	.catch(() => { // В случае ошибки
		TimeLast.innerHTML = "Времена не найдены!" // Пишем предупреждение вместо оставшегося времени
		TimesFill(); // Очищаем времена
		throw "Times not found!"; // И повторно вызываем ошибку, останавливая программу
	});

	TimesFill(dayTimes); // Обновляем времена намазов
	LastTimer(dayTimes); // Запускаем отчет до намаза
}


// Функция заполнения времен намазов
function TimesFill(times) { // Принимает времена на день
	if(times) { // Если времена заданы...
		nam_times.forEach((nam, i) => nam.innerHTML = Lzero(times[i][0]) + ":" + Lzero(times[i][1])) // Выводим время каждого намаза
	} else { // В противном случае...
		nam_times.forEach(nam => nam.innerHTML = "") // Заполням пустышками
	}
}


// Функция парсинга времен
async function TimesParse(t) {
	if(t.getMonth() != TimesM) { // Если месяц сменился...
		return await fetch(`${TimesFolder}/${Lzero(t.getMonth() + 1)}_${t.getFullYear()}.txt`) // Запрашиваем файл времен
			.then(times => times.text()) // В случае успеха достаём из ответа текст
			.then(times => times.split(DaySplit)) // Далее разделяем времена по дням
			.then(times => {
				times.forEach((day, i) => // Перебираем каждый день
					{	
						times[i] = day.split(NamSplit); // И делим намазы друг от друга
						times[i].forEach((namaz, j) => times[i][j] = namaz.split(TimeSplit)); // И в каждом намазе делим часы и минуты
					})
				TimesM = t.getMonth(); // Обновляем месяц
				TimesList = times; // Записываем времена
				return times[t.getDate() - 1]; // Возвращаем времена на день
			});
	} else { // Такое разделение, чтобы в случае ошибки в fetch она вернулась из функции
		return times[t.getDate() - 1]; // Возвращаем времена на день
	}
}


// Функция добавления вудущего нуля при надобности (1 => 01, 02 => 02)
function Lzero(num) {
	num = num.toString(); // Преобразуем в строку, если это число
	return num.length < 2 ? '0' + num : num; // Если длина меньше 2, прибавляем впереди нолик
}

DaySet(new Date);
SetTheme(1)
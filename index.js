doThatStuff('https://keev.me/f/slowpoke.php')

/**
 * Рендерит черный квадрат, спустя delay анимирует квадрат и посылате запрос,
 *  после анимации и получения ответа, меняет цвет квадрата.
 *
 * @param url - ендпоинт запроса
 * @param delay - задержка до начала анимации и запроса
 */
function doThatStuff(url, delay = 1000) {
  warn('function started')

  if (!isUrlValid(url)) {
    throw new Error()
  }

  // Сохраняем элемент в контексте IEFE, чтобы иметь возможность манипулировать его анимацией и цветом
  const square = document.createElement('div')
  renderSquare(square)

  warn('square rendered')

  // Спустя секунду начинаем анимацию и посылаем запрос к API
  setTimeout(async () => {
    // Promise.all гарантирует, что дальнейший код (смена цвета квадрата) исполнится
    // только после того, как разрешатся оба промиса
    const [_, apiResponse] = await Promise.all([
      animateSquare(square),
      // возможные сетевые ошибки обрабатываем внутри метода
      getUrlData(url)
    ])

    changeSquareColor(square, apiResponse)
    warn('square painted with apiResponse: ' + apiResponse)
  }, delay)

  /********************************
   * Служебные функции и константы
   ********************************/

  /** Используется для индикации состояния ответа сервера
   * @type {{readonly SUCCESS: number, _SUCCESS: number, _ERROR: number, readonly ERROR: number, _FAILURE: number, readonly FAILURE: number}}
   */
  const RESPONSE_STATE = {
      // мы не хотим, чтобы кто-то менял свойства этого объекта - эмулируем защищенные свойства
      _FAILURE: 0,
      _SUCCESS: 1,
      _ERROR: -1,
      get FAILURE() { return this._FAILURE },
      get SUCCESS() { return this._SUCCESS },
      get ERROR() { return this._ERROR }
    }

  /**
   * Простая проверка валидности url
   * @param url
   * @returns {boolean}
   */
  function isUrlValid(url) {
    return /^(http|https):\/\/[^ "]+$/.test(url)
  }

  /**
   * Задаем свойства квадрата и добавляем его в DOM
   * @param square - DOM элемент
   */
  function renderSquare(square) {
    // позиционируем абсолютно, тем самым избегаем reflow при анимации
    square.style.position = 'absolute'
    // кроме отсутствия reflow абсолютное позиционирование позволяет нам
    // расположить квадрат точно в левом верхнем углу вне зависимости от дефолтных стилей браузера
    square.style.left = '0'
    square.style.top = '0'
    square.style.height = '100px'
    square.style.width = '100px'
    square.style.backgroundColor = 'black'
    document.body.prepend(square)
  }

  /**
   * Анимирует движение квадрата слева направо
   * @param square - DOM элемент
   * @param duration - продолжительность анимации
   * @param distanceX - смещение
   * @returns {Promise<Animation>}
   */
  function animateSquare(square, duration = 1000, distanceX = '100px') {
    const {finished} = square.animate([
      { transform: 'translate3D(0, 0, 0)' },
      { transform: `translate3D(${distanceX}, 0, 0)` }
    ], {
      fill: "forwards",
      duration,
    })

    warn('animation started')

    // Промис finished разрешиться, когда анимация закончится
    return finished.then(p => {
      warn('animation finished')
      return p
    })
  }

  /**
   * Посылает запрос на сервер и возвращает одно из значений RESPONSE_STATE.
   * @param url
   * @returns {Promise<Response>}
   */
  function getUrlData(url) {
    warn('request send')

    return fetch(url)
      .then(res => {
        warn('response got')

        if (res.status !== 200) {
          // при ошибке на сервере возвращаем
          // -1 - RESPONSE_STATE.ERROR
          return Promise.resolve(RESPONSE_STATE.ERROR)
        }

        // по условиям задачи (API контракту) может быть только
        // 0 - RESPONSE_STATE.FAILURE и
        // 1 - RESPONSE_STATE.SUCCESS
        return res.json()
      })
      .catch(() => {
        warn('network error')
        // при сетевой ошибке возвращаем
        // -1 - RESPONSE_STATE.ERROR
        return Promise.resolve(RESPONSE_STATE.ERROR)
      })
  }

  /**
   * Изменяет цвет квадрата в зависимости от responseState.
   * @param square - DOM Элемент
   * @param responseState - Код ответа сервера
   */
  function changeSquareColor(square, responseState) {
    switch (responseState) {
      case RESPONSE_STATE.SUCCESS:
        square.style.backgroundColor = 'green'
        break
      case RESPONSE_STATE.FAILURE:
        square.style.backgroundColor = 'blue'
        break
      case RESPONSE_STATE.ERROR:
        square.style.backgroundColor = 'red'
        break
      default:
        throw Error('Unknown response')
    }
  }

  /**
   * Отмечает в консоли сообщения с моментом времени.
   * @param message
   */
  function warn(message) {
    console.warn(`${message} at:`, performance.now())
  }
}



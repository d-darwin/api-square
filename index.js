doThatStuff('https://keev.me/f/slowpoke.php')

function doThatStuff(url) {
  warn('function started')

  // Используется для индикации состояния ответа сервера
  const RESPONSE_STATE = {
    // мы не хотим, чтобы кто-то менял свойства этого объекта - эмулируем защищенные свойства
    _FAILURE: 0,
    _SUCCESS: 1,
    _ERROR: -1,
    get FAILURE() { return this._FAILURE },
    get SUCCESS() { return this._SUCCESS },
    get ERROR() { return this._ERROR }
  }

  if (!isUrlValid()) {
    throw new Error()
  }

  // Сохраняем элемент в контексте IEFE, чтобы иметь возможность манипулировать его анимацией и цветом
  const square = document.createElement('div')
  renderSquare()

  warn('square rendered')

  // Спустя секунду начинаем анимацию и посылаем запрос к API
  setTimeout(async () => {
    try {
      // Promise.all гарантирует, что дальнейший код (смена цвета квадрата) исполнится
      // только после того, как разрешатся оба промиса
      const [_, apiResponse] = await Promise.all([
        animateSquare(),
        getUrlData()
      ])

      changeSquareColor(apiResponse)
      warn('square painted')
    } catch (e) {
      warn('network error')
      throw e
    }
  }, 1000)


  /*******************
   * Служебные функции
   *******************/

  /**
   * Простая проверка валидности url
   * @returns {boolean}
   */
  function isUrlValid() {
    return /^(http|https):\/\/[^ "]+$/.test(url)
  }

  /**
   * Задаем свойства квадрата и добавляем его в DOM
   */
  function renderSquare() {
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
   * Анимирует движение квадрата в течении заданного времени
   * @param duration
   * @param distanceX
   * @returns {Promise<Animation>}
   */
  function animateSquare(duration = 1000, distanceX = '100px') {
    const {finished} = square.animate([
      // используем translate3D, т.к. это вынесет элемент в отдельный слой и его анимацией будет заниматься GPU
      { transform: 'translate3D(0, 0, 0)' },
      // скорость движения квадрата 100px/duration
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
   * Посылает запрос на сервер и возвращает одно из значений RESPONSE_STATE
   * @returns {Promise<Response>}
   */
  function getUrlData() {
    warn('request send')

    return fetch(url).then(res => {
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
  }

  /**
   * Изменяет цвет квадрата в зависимости от responseState
   * @param responseState
   */
  function changeSquareColor(responseState) {
    switch (responseState) {
      case RESPONSE_STATE.SUCCESS:
        // console.log('RESPONSE_STATE.SUCCESS')
        square.style.backgroundColor = 'green'
        break
      case RESPONSE_STATE.FAILURE:
        // console.log('RESPONSE_STATE.FAILURE')
        square.style.backgroundColor = 'blue'
        break
      case RESPONSE_STATE.ERROR:
        // console.log('RESPONSE_STATE.ERROR')
        square.style.backgroundColor = 'red'
        break
      default:
        throw Error('Unknown response')
    }
  }

  function warn(message) {
    console.warn(`${message} at:`, performance.now())
  }
}



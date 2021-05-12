const url = 'https://keev.me/f/slowpoke.php';

// Пишем функцию в виде IEFE, чтобы не помешать другим скриптам.
// Конечно, в таком случае и ulr использовать в глобальной области видимости тоже не очень разумно,
// но это в конце-концов, просто тестовое задание, где нужно что-то продемонстрировать )))
(async function (url) {
  console.warn('function started at:', performance.now())
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
  console.warn('square rendered at:', performance.now())

  setTimeout(async () => {
    // Promise.all гарантирует, что дальнейший код (смена цвета квадрата) исполнится только после того,
    // как закончится анимация и будет получен ответ от API.
    const [_, apiResponse] = await Promise.all([
      // Через две секунды после вызова (то есть через одну секунду после старта движения) квадрат должен остановиться.
      animateSquare(1000),
      // В этот же момент (через секунду после вызова функции) посылается GET-запрос на переданный URL.
      getUrlData()
    ])

    // меняем цвет квадрата только после того закончена его анимация и получен ответ от API
    changeSquareColor(apiResponse)
  }, 1000)


  /**
   * Служебные функции
   */

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
   * Анимирует движение квадрата
   * @param duration
   * @returns {Promise<Animation>}
   */
  function animateSquare(duration) {
    const {finished} = square.animate([
      // используем translate3D, т.к. это вынесет элемент в отдельный слой и его анимацией будет заниматься GPU
      { transform: 'translate3D(0, 0, 0)' },
      // скорость движения квадрата 100px/duration
      { transform: 'translate3D(100px, 0, 0)' }
    ], {
      fill: "forwards",
      duration,
    })

    console.warn('animation started at:', performance.now())
    // Промис finished разрешиться, когда анимация закончится
    return finished.then(p => {
      console.warn('animation finished at:', performance.now())
      return p
    })
  }

  /**
   * Посылает запрос на сервер и возвращает одно из значений RESPONSE_STATE
   * @returns {Promise<Response>|Promise<RESPONSE_STATE._ERROR>}
   */
  function getUrlData() {
    console.warn('request send at:', performance.now())
    try {
      return fetch(url)
        .then(res => {
          console.warn('response got at:', performance.now())
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
    } catch (e) {
      // при сетевой ошибке возвращаем
      // -1 - RESPONSE_STATE.ERROR
      return Promise.resolve(RESPONSE_STATE.ERROR)
    }
  }

  /**
   * Изменяет цвет квадрата в зависимости от responseState
   * @param responseState
   */
  function changeSquareColor(responseState) {
    switch (responseState) {
      case RESPONSE_STATE.SUCCESS:
        console.log('RESPONSE_STATE.SUCCESS')
        square.style.backgroundColor = 'green'
        break
      case RESPONSE_STATE.FAILURE:
        console.log('RESPONSE_STATE.FAILURE')
        square.style.backgroundColor = 'blue'
        break
      case RESPONSE_STATE.ERROR:
        console.log('RESPONSE_STATE.ERROR')
        square.style.backgroundColor = 'red'
        break
      default:
        square.style.backgroundColor = 'yellow'
        throw Error('Unknown response')
    }
  }
})(url)



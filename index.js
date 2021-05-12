// Инкапсулируем функцию в IEFE, чтобы не помешать другим скриптам
(async function (url) {
  const RESPONSE_STATE = {
    // мы не хотим, чтобы кто-то менял эти свойства,
    // эмулируем защищенные свойства
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

  const apiData = await getUrlData()
  switch (apiData) {
    case RESPONSE_STATE.SUCCESS:
      console.log('Успех')
      break
    case RESPONSE_STATE.FAILURE:
      console.log('Провал')
      break
    case RESPONSE_STATE.ERROR:
      console.log('Ошибка')
      break
    default:
      throw Error('Unknown response')
  }

  console.log('apiData', apiData)


  /** Служебные функции */

  /**
   * Простая проверка валидности url
   * @param
   * @returns {boolean}
   */
  function isUrlValid() {
    return /^(http|https):\/\/[^ "]+$/.test(url)
  }

  /**
   *
   * @returns {Promise<Response>|Promise<RESPONSE_STATE._ERROR>}
   */
  function getUrlData() {
    try {
      return fetch(url)
        .then(res => {
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
})('https://keev.me/f/slowpoke.php')



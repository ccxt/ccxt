---
title: "FAQ"
description: "위와 같이 짧은 형식으로 질문을 작성하시면 도움을 드리기 어렵습니다. 저희는 프로그래밍을 가르치지 않습니다. 매뉴얼을 읽고 이해하지 못하거나…"
---

# 자주 묻는 질문


  ## 코드를 실행하려고 하는데 작동하지 않습니다. 어떻게 고치나요?

  위와 같이 짧은 형식으로 질문을 작성하시면 도움을 드리기 어렵습니다. 저희는 프로그래밍을 가르치지 않습니다. [매뉴얼](/docs)을 읽고 이해하지 못하거나, 이슈를 보고하는 방법에 관한 [CONTRIBUTING](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md) 문서의 지침을 정확히 따르지 못하신다면 도움을 드리기 어렵습니다. CONTRIBUTING 가이드를 읽고 이슈 보고 방법을 숙지하신 후 매뉴얼을 읽어보세요. 매뉴얼 전체를 꼼꼼히 읽지 않고 누군가의 돈과 시간을 위험에 빠뜨려서는 안 됩니다. 수많은 세부 사항이 담긴 방대한 분량의 내용을 읽는 것에 익숙하지 않다면 어떤 것도 위험에 빠뜨려서는 안 됩니다. 또한, 사용하시는 프로그래밍 언어에 자신이 없다면, 코딩 기초와 실습을 위한 훨씬 좋은 곳들이 있습니다. `python tutorials`, `js videos` 등을 검색하고, 예제를 다루면서 연습하세요. 이것이 다른 사람들이 학습 곡선을 극복하는 방법입니다. 무언가를 배우고 싶다면 지름길은 없습니다.

  ## 도움을 받으려면 무엇이 필요한가요?

  질문할 때:

  - 먼저 검색 버튼을 사용하여 중복 질문이 없는지 확인하세요!
  - **`verbose` 모드로 요청과 응답을 게시하세요!** 문제가 발생하는 줄 바로 앞에 `exchange.verbose = true`를 추가하고, 화면에 표시되는 내용을 복사하여 붙여넣으세요. 이는 [문제 해결](/docs/manual#troubleshooting) 섹션, [README](https://github.com/ccxt/ccxt/blob/master/README.md), 그리고 [이전 이슈](https://github.com/ccxt/ccxt/issues) 및 [풀 리퀘스트](https://github.com/ccxt/ccxt/pulls)에 대한 많은 답변에 이미 작성되어 언급되어 있습니다. 예외는 없습니다. verbose 출력에는 거래소의 요청과 응답이 모두 포함되어야 합니다.
  - 전체 오류 콜스택을 포함하세요!
  - 프로그래밍 언어 **및 언어 버전 번호**를 기재하세요
  - CCXT / CCXT Pro 라이브러리 버전 번호를 기재하세요
  - 어느 거래소인지 기재하세요
  - 호출하려는 메서드를 기재하세요

  - **문제를 재현하는 코드를 게시하세요.** 완전하고 짧게 실행 가능한 프로그램으로 만들고, 줄을 생략하지 말고 최대한 간결하게 작성하세요 (코드 5-10줄), 거래소 인스턴스화 코드를 포함하여. 관련 없는 부분은 모두 제거하고 이슈를 재현하는 코드의 핵심만 남기세요.
    - **코드나 오류의 스크린샷을 게시하지 마세요. 출력과 코드를 일반 텍스트로 게시하세요!**
    - **코드와 출력을 삼중 백틱으로 감싸세요: &#096;&#096;&#096;GOOD&#096;&#096;&#096;**.
    - 백틱 기호(&#096;)를 따옴표 기호(\')와 혼동하지 마세요: '''BAD'''
    - 단일 백틱과 삼중 백틱을 혼동하지 마세요: &#096;BAD&#096;

  - **`apiKey`와 `secret`을 게시하지 마세요!** 안전하게 보관하세요 (게시 전 제거하세요)!

  ## 메서드를 호출하면 오류가 발생합니다. 무엇이 잘못된 건가요?

  이슈를 올바르게 보고하지 않으신 것입니다 ) 커뮤니티가 도움을 드릴 수 있도록 협조해 주세요 ) 다음을 읽고 단계를 따라하세요: https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-submit-an-issue. 다시 한번 말씀드리지만, 이슈를 재현하는 코드와 verbose 요청 및 응답은 **필수입니다**. *오류 추적만, 또는 응답만, 또는 요청만, 또는 코드만으로는 충분하지 않습니다!*

  ## 메서드 호출에서 잘못된 결과가 나왔습니다. 도움을 받을 수 있나요?

  기본적으로 이전 질문과 동일한 답변입니다. 다음을 **정확히** 읽고 따르세요: https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-submit-an-issue. 다시 한번 말씀드리지만, 이슈를 재현하는 코드와 verbose 요청 및 응답은 **필수입니다**. *오류 추적만, 또는 응답만, 또는 요청만, 또는 코드만으로는 충분하지 않습니다!*

  ## `bar` 거래소에 `foo` 기능을 구현해 줄 수 있나요?

  네, 가능합니다. 그리고 다른 누군가가 먼저 하지 않는다면 저희가 할 것입니다. 이런 유형의 질문을 하는 것은 별로 의미가 없습니다. 답변은 항상 긍정적이기 때문입니다. 누군가가 이것저것 할 수 있는지 물어볼 때, 그것은 저희의 능력에 관한 것이 아니라, 누적된 모든 기능 요청을 구현하는 데 필요한 시간과 관리 문제로 귀결됩니다.

  더욱이, 이것은 진행 중인 오픈 소스 라이브러리입니다. 즉, 이 프로젝트는 이를 사용하는 사용자 커뮤니티에 의해 개발될 것을 목적으로 합니다. 여러분이 묻는 것은 저희가 구현할 수 있는지 여부가 아니라, 사실상 저희에게 그 특정 작업을 하라고 말하는 것이며, 이것은 저희가 생각하는 자발적인 협력 방식이 아닙니다. 여러분의 기여, PR, 커밋을 환영합니다: https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code.

  저희는 무료 오픈 소스 작업에 대한 약속이나 일정을 제공하지 않습니다. 속도를 높이고 싶다면 info@ccxt.trade로 연락해 주세요.

  ## `bar` 거래소에 `foo` 기능은 언제 추가되나요? 예상 시간은 얼마나 되나요? 언제쯤 기대할 수 있나요?

  저희는 오픈 소스 작업에 대한 약속이나 일정을 제공하지 않습니다. 그 이유는 이전 단락에 설명되어 있습니다.

  ## 이슈에서 요청된 거래소 지원은 언제 추가되나요?

  다시 말씀드리지만, 위에서 설명한 이유로 이 거래소나 저 거래소를 추가하는 날짜를 약속드릴 수 없습니다. 답변은 항상 같습니다: _최대한 빨리_.

  ## 기능이 추가될 때까지 얼마나 기다려야 하나요? 직접 구현할지, CCXT 개발팀이 구현해 줄 때까지 기다릴지 결정해야 합니다.

  직접 구현하세요. 저희를 기다리지 마세요. 저희는 최대한 빨리 추가할 것입니다. 또한, 여러분의 기여를 매우 환영합니다:

  - https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code

  ## 이전에 요청된 `foo` 기능 추가 진행 상황은 어떻게 되나요? `bar` 거래소 구현은 어떻게 진행되고 있나요?

  이런 유형의 질문은 보통 시간 낭비입니다. 답변하는 데 컨텍스트 전환에 너무 많은 시간이 필요하고, 새로운 기능이나 새로운 거래소에 대한 코드로 요청을 실제로 처리하는 것보다 이 질문에 답변하는 데 더 많은 시간이 걸리는 경우가 많습니다. 이 오픈 소스 프로젝트의 진행 상황도 공개되어 있으므로, 어떻게 진행되고 있는지 궁금하다면 커밋 이력을 살펴보세요.

  ## 이 PR의 상태는 어떻게 되나요? 업데이트가 있나요?

  병합되지 않았다면, PR에 먼저 수정해야 할 오류가 포함되어 있다는 의미입니다. 그대로 병합될 수 있었다면 저희가 병합했을 것이고, 처음부터 이 질문을 하지 않으셨을 것입니다. PR이 병합되지 않는 가장 빈번한 이유는 [CONTRIBUTING 가이드라인](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#derived-exchange-classes) 중 하나를 위반했기 때문입니다. 해당 가이드라인은 문자 그대로 따라야 하며, PR을 빠르게 병합하려면 한 줄이나 한 단어도 빠뜨릴 수 없습니다. 가이드라인을 위반하지 않는 코드 기여는 거의 즉시 병합됩니다 (보통 몇 시간 내에).

  ## PR에서 수정해야 할 오류나 마스터 브랜치에 병합하기 위해 편집해야 할 내용을 알려주실 수 있나요?

  안타깝게도, 저희는 병합을 방해하는 코드의 각각의 모든 오류를 빠르게 나열할 시간이 항상 있는 것은 아닙니다. 무엇을 해야 하는지 설명하는 것보다 직접 오류를 수정하는 것이 더 쉽고 빠른 경우가 많습니다. 대부분은 이미 [CONTRIBUTING 가이드라인](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#derived-exchange-classes)에 설명되어 있습니다. 기본 원칙은 **모든 가이드라인을 문자 그대로** 따르는 것입니다.

  ## 업로드한 수정 사항이 TypeScript로 되어 있는데, JavaScript / Python / PHP도 수정해 주실 수 있나요?

  저희의 빌드 시스템이 거래소별 JavaScript, Python, PHP, C#, Go 및 Java 코드를 자동으로 생성하므로, TypeScript에서 트랜스파일되며 모든 언어를 별도로 하나씩 수정할 필요가 없습니다.

  따라서, TypeScript에서 수정되면 JavaScript NPM, Python pip, PHP Composer, C# NuGet, Go 및 Java에서도 수정됩니다. 자동 빌드는 보통 15-20분 정도 걸립니다. **새 버전이 출시된 후** `npm`, `pip` 또는 `composer`로 버전을 업그레이드하면 됩니다.

  자세한 내용은 여기를 참고하세요:

  - https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#multilanguage-support
  - https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#transpiled-generated-files


  ## takeProfit+stopLoss가 포함된 주문은 어떻게 생성하나요?
  일부 거래소는 추가적인 "연결된" `stopLoss` & `takeProfit` 하위 주문과 함께 `createOrder`를 지원합니다 - [포지션에 연결된 StopLoss 및 TakeProfit 주문](/docs/manual#stoploss-and-takeprofit-orders-attached-to-a-position)을 참고하세요. 
  그러나 일부 거래소는 해당 기능을 지원하지 않을 수 있으며, 이미 열린 포지션에 조건부 주문(예: ***trigger order | stoploss order | takeprofit order**)을 추가하려면 별도의 `createOrder` 메서드를 실행해야 합니다 - [조건부 주문](/docs/manual#conditional-orders)을 참고하세요.
  `exchange.has['createOrderWithTakeProfitAndStopLoss']`, `exchange.has['createStopLossOrder']`, `exchange.has['createTakeProfitOrder']`를 확인하여 지원 여부를 알 수 있지만, `.features` 속성만큼 정확하지는 않습니다.

  ## `takeProfit/stopLoss`와 `takeProfitPrice/stopLossPrice` 주문의 차이점은 무엇인가요?

  CCXT에서는 여러 유형의 takeProfit/stopLoss 주문을 구분합니다. 거래소가 이 기능을 지원하는 경우, 동일한 요청 내에서 포지션을 여는 동시에 take-profit 또는 stop-loss 주문을 연결하여 배치하려면 `takeProfit/stopLoss` 구문을 사용해야 합니다.
  이러한 연결된 TP/SL 주문을 **type 3**라고 합니다.

  예시:
  ```python
    params = {
      'stopLoss': {
          'triggerPrice': 12.34,  # at what price it will trigger
          'price': 12.00,  # if exchange supports, 'price' param would be limit price (for market orders, don't include this param)
        },
        'takeProfit': {
            # similar params here
        }
    }
    order = exchange.create_order ('SOL/USDT', 'limit', 'buy', 0.5, 13, params)
  ```

  거래소가 이러한 연결된 주문을 지원하지 않거나, stop loss/take profit 주문으로 작동할 독립적인 주문을 배치하려는 경우 `stopLossPrice` **또는** `takeProfitPrice` 주문을 배치할 수 있으며, 이러한 독립적인 sl/tp 주문을 **type 2**라고 합니다.

  예시
  ```python
      symbol = 'ADA/USDT:USDT'
      main_order = await binance.create_order(symbol, 'market', 'buy', 50) # open position
      tp_order = await binance.create_order(symbol, 'limit', 'sell', 50, 1.5, {"takeProfitPrice": 1.6}) # take profit order
      sl_order = await binance.create_order(symbol, 'limit', 'sell', 50, 0.24, {"stopLossPrice": 0.25}) # stop loss order
  ```

 ## 트레일링 주문은 어떻게 작동하나요?
  일부 거래소는 `createOrder`를 사용하여 `trailingPercent` 또는 `trailingAmount` 주문을 생성하는 것을 지원합니다 - 참고: [트레일링 주문](/docs/manual#trailing-orders)
  
  트레일링 주문은 현재 시장 가격보다 백분율 또는 호가 금액만큼 뒤에서 따라갑니다. 주문은 한 방향으로만 트레일링되어 결국 실행될 수 있습니다. 실행된 주문은 시장 주문 또는 지정가 주문일 수 있습니다. 트레일링 주문은 보통 포지션을 열기 위해 배치하거나, `reduceOnly` 파라미터를 true로 설정하여 포지션을 닫기 위해 결합할 수 있습니다. 어떤 주문이 허용되는지에 대한 세부 사항은 거래소에 따라 다릅니다. 트레일링 주문은 종종 `trailingTriggerPrice` 파라미터를 지원하며, 현재 시장 가격이 해당 값을 교차하면 `trailingPercent` 또는 `trailingAmount`로 설정된 트레일링 함수가 시작됩니다.
  
  일부 거래소는 이 트레일링 기능을 지원하지 않을 수 있습니다. `.features` 속성을 확인하세요. 또한 사용 중인 거래소의 `createOrder`에 `trailingPercent` 또는 `trailingAmount`가 docstring에서 사용 가능한 파라미터로 있는지 확인할 수 있습니다. 일부 거래소는 `exchange.has['createTrailingPercentOrder']` 또는 `exchange.has['createTrailingAmountOrder']`가 true로 설정되어 있을 수 있으며, 이는 `createOrder`에서 `trailingPercent` 또는 `trailingAmount` 파라미터를 사용할 수 있음을 나타냅니다.

`trailingPercent` 및 `trailingAmount` 주문 생성 예시:
  ```python
    params = {
      'trailingPercent': 1.0, # percentage away from the current market price, 1.0 means 1%
      # 'trailingAmount': 100.0, # quote amount away from the current market price, for a SOL/USDT pair this is 100 USDT away from the current market price.
      # 'trailingTriggerPrice': 44500.0, # the price to trigger activating a trailing stop order
      'reduceOnly': True, # set to true if you want to close a position, set to false if you want to open a new position
    }
    order = exchange.create_order ('SOL/USDT:USDT', 'market', 'sell', 0.5, None, params)
  ```
  ```python
    trailingAmount = 100.0
    trailingTriggerPrice = 115.0
    params = {
        'reduceOnly': True,
    }
    order = exchange.create_trailing_amount_order ('SOL/USDT:USDT', 'market', 'sell', 0.5, None, trailingAmount, trailingTriggerPrice, params)
  ```
  ```python
    trailingPercent = 1.0
    trailingTriggerPrice = 115.0
    params = {
        'reduceOnly': False,
    }
    order = exchange.create_trailing_percent_order ('SOL/USDT:USDT', 'limit', 'buy', 0.5, 13, trailingPercent, trailingTriggerPrice, params)
  ```

  ## 비용으로 현물 시장가 매수를 생성하는 방법은?
  비용으로 시장가 매수 주문을 생성하려면, 먼저 거래소가 해당 기능을 지원하는지 확인해야 합니다 (`exchange.has['createMarketBuyOrderWithCost']).
  지원한다면 `createMarketBuyOrderWithCost` 메서드를 사용할 수 있습니다.
  예시:
  ```python
  order = await exchange.createMarketBuyOrderWithCost(symbol, cost)
  ```

## `createMarketBuyRequiresPrice` 옵션은 무엇을 의미하나요?

많은 거래소에서는 현물 시장가 매수 주문을 할 때 기준 통화 수량이 아닌 호가 통화(quote currency) 수량을 요구합니다. 이러한 경우 거래소는 `createMarketBuyRequiresPrice` 옵션이 `true`로 설정됩니다.

예시: BTC/USDT를 시장가 매수로 구매하려면 0.000X가 아닌 amount = 5 USDT를 제공해야 합니다. 사용자들이 보통 기준 통화로 수량을 제공하기 때문에, 오류를 방지하기 위해 명시적으로 가격을 요구하는 검사를 포함하고 있습니다.

따라서 기본적으로 `create_order(symbol, 'market,' 'buy,' 10)`을 실행하면, 해당 옵션이 있는 거래소에서는 오류가 발생합니다 (`createOrder() requires the price argument for market buy orders to calculate the total cost to spend (amount * price), alternatively set the createMarketBuyOrderRequiresPrice option or param to false...`).

거래소가 비용을 요구하는데 사용자가 기준 통화 수량을 제공한 경우, 비용을 계산하기 위해 추가 파라미터인 **price**를 요청하고 이를 곱해야 합니다. 이 동작을 이해하고 있다면 `createMarketBuyOrderRequiresPrice`를 비활성화하고 amount 파라미터에 비용을 전달할 수 있지만, 비활성화해도 호가 통화 대신 기준 통화 수량으로 주문할 수 있다는 의미는 아닙니다.

`create_order(symbol, 'market', 'buy', 0.001, 20000)`을 실행하면 ccxt는 필요한 가격을 사용하여 `0.01*20000`을 계산해 그 값을 거래소에 전송합니다.

amount 인수에 비용을 직접 제공하고 싶다면 `exchange.options['createMarketBuyOrderRequiresPrice'] = False`로 설정하고 (시장가 매수에서 amount가 비용임을 인정하는 것입니다), 그 후 `create_order(symbol, 'market', 'buy', 10)`을 실행할 수 있습니다.

이것은 기본적으로 사용자가 `create_order('SHIB/USDT', market, buy, 1000000)`을 실행하면서 100만 SHIB를 구매하려는 것으로 생각하지만 실제로는 100만 USDT 상당의 SHIB를 구매하는 상황을 방지하기 위한 것입니다. 이러한 이유로 ccxt는 기본적으로 amount 파라미터에 기준 통화를 받습니다.

또는 사용 가능한 경우 `createMarketBuyOrderWithCost`/`createMarketSellOrderWithCost` 함수를 사용할 수 있습니다.

  더 보기: [Market Buys](/docs/manual#market-buys)

  ## 현물 거래와 스왑/무기한 선물 거래의 차이점은?
  현물 거래는 금융 상품(예: 암호화폐)을 즉시 인도받기 위해 매수하거나 매도하는 것입니다. 자산을 직접 교환하는 간단한 방식입니다.

  반면 스왑 거래는 두 당사자가 기초 자산을 기반으로 미래의 특정 날짜에 금융 상품이나 현금 흐름을 교환하는 파생 계약을 포함합니다. 스왑은 레버리지, 투기 또는 헤징에 자주 사용되며 계약이 만료될 때까지 반드시 기초 자산을 교환할 필요는 없습니다.


  또한 스왑을 거래할 때는 기준 통화(예: BTC)를 직접 다루는 것이 아니라 계약을 다루게 되므로, `amount = 1`로 주문을 생성하면 BTC 수량은 `contractSize`에 따라 달라집니다. 계약 크기는 다음과 같이 확인할 수 있습니다:

  ```python
  await exchange.loadMarkets()
  symbol = 'XRP/USDT:USDT'
  market = exchange.market(symbol)
  print(market['contractSize'])
  ```

  ## "must be greater than minimum amount precision of 1" 오류가 발생하는 이유는?
  이 오류는 계약 시장에서 주문을 생성할 때 자주 발생합니다. 이 오류는 거래소가 createOrder의 amount 인수에 자연수(1, 2, 3 등)의 계약 수를 기대할 때 발생합니다.
  
  각 계약은 contractSize로 결정되는 특정 기준 자산 수량에 해당합니다. 심볼의 시장 구조에서 contractSize를 다음과 같이 가져올 수 있습니다:
  ```python
  await exchange.loadMarkets()
  symbol = 'SOL/USDT:USDT'
  market = exchange.market(symbol)
  print(market['contractSize'])
  ```

  `amount = 1`로 주문을 생성하면, 해당 주문에 사용되는 기준 자산의 수량은 심볼의 `contractSize`에 따라 달라집니다.

  아래는 기준 자산의 0.5를 사용하고 싶을 때 amount 인수에 사용해야 할 `contracts` 수를 구하는 공식과 예시입니다:
  ```python
  await exchange.loadMarkets()
  symbol = 'SOL/USDT:USDT'
  market = exchange.market(symbol)
  # Converting a 0.5 base amount to the number of contracts:
  # Formula: contracts = (base amount / contract size)
  contracts = round(0.5 / market['contractSize'])
  ```

  amount 인수에 1 계약을 사용했을 때 사용될 기준 자산 수량을 구하는 예시:
  ```python
  await exchange.loadMarkets()
  symbol = 'SOL/USDT:USDT'
  market = exchange.market(symbol)
  # Finding the base amount that will be used with 1 contract:
  # Formula: base amount = (contracts * contract size)
  contracts = 1
  base_amount = (contracts * market['contractSize'])
  ```

  ## reduceOnly 주문을 하는 방법은?
  reduceOnly 주문은 포지션을 늘리지 않고 줄이기만 하는 주문 유형입니다. reduceOnly 주문을 하려면 일반적으로 reduceOnly 파라미터를 true로 설정하여 createOrder 메서드를 사용합니다. 이렇게 하면 주문이 열린 포지션의 크기를 줄이는 경우에만 체결되며, 포지션 크기를 늘리게 될 경우 부분 체결되거나 전혀 체결되지 않습니다.


```javascript tab="JavaScript"
const params = {
    'reduceOnly': true, // set to true if you want to close a position, set to false if you want to open a new position
}
const order = await exchange.createOrder (symbol, type, side, amount, price, params)
```
```python tab="Python"
params = {
    'reduceOnly': True, # set to True if you want to close a position, set to False if you want to open a new position
}
order = exchange.create_order (symbol, type, side, amount, price, params)
```
```php tab="PHP"
$params = {
    'reduceOnly': true, // set to true if you want to close a position, set to false if you want to open a new position
}
$order = $exchange->create_order ($symbol, $type, $side, $amount, $price, $params);
```


  ## 통합 메서드가 사용하는 엔드포인트를 확인하는 방법은?
  CCXT 라이브러리에서 통합 메서드가 사용하는 엔드포인트를 확인하려면 일반적으로 관심 있는 특정 거래소 구현의 라이브러리 소스 코드를 참조해야 합니다. CCXT의 통합 메서드는 상호작용하는 특정 엔드포인트의 세부 정보를 추상화하므로, 이 정보는 라이브러리의 API를 통해 직접 노출되지 않습니다. 자세한 검사를 위해서는 GitHub에 있는 CCXT 라이브러리 소스 코드에서 해당 거래소의 메서드 구현을 살펴볼 수 있습니다.

  더 보기: [Unified API](/docs/manual#unified-api)

  ## 펀딩 비율 구조에서 previousFundingRate, fundingRate, nextFundingRate의 차이점은?
  펀딩 비율 구조에는 반환될 수 있는 세 가지 다른 펀딩 비율 값이 있습니다:
  1. `previousFundingRate`는 가장 최근에 완료된 비율을 나타냅니다.
  2. `fundingRate`는 다음에 적용될 비율입니다. 이 값은 펀딩 시간이 지나 previousFundingRate가 될 때까지 계속 변합니다.
  3. `nextFundingRate`는 일부 거래소에서만 지원되며, 다음 비율 이후에 예측되는 펀딩 비율입니다. 이 값은 지금으로부터 두 번째 펀딩 비율입니다.

  예를 들어 현재 시간이 12:30이라고 가정합니다. `previousFundingRate`는 12:00에 발생했으며, `fundingRate` 값을 확인하여 다음 펀딩 비율을 알아보려고 합니다. 이 예시에서 4시간 간격을 기준으로, `fundingRate`는 미래 4:00에 발생할 예정이며, `nextFundingRate`는 8:00에 발생할 예정인 예측 비율입니다.

## CCXT에서 Lighter Exchange를 사용하는 방법은?

Lighter는 CCXT의 일부로 제공되며 다른 CCXT 거래소와 유사하게 작동하지만, 일부 사용자에게는 혼란스러울 수 있는 몇 가지 특이점이 있으며 아래에서 자세히 설명합니다. 기본 자격 증명과 종속성만 설정하면 됩니다.


최신 업그레이드 이후 CCXT는 인증 프로세스를 간소화했으며, 이제 L1 개인 키만으로도 충분합니다.

## 자격 증명 요구 사항

Lighter는 다음을 요구합니다:
- `privateKey`: L1 개인 키 **필수**
- `exchange.options`의 `accountIndex` (정수): **선택 사항** — CCXT가 사용 불가한 경우 가져오며, 서브 계정 사용 시 설정
- `exchange.options`의 `apiKeyIndex` (정수): **선택 사항** CCXT가 기본값(254)을 사용함

예시

```python
lighter = ccxt.lighter({
	'privateKey': 'XXXXXXX', # l1 private key
})
```

### 종속성 요구 사항

서명 알고리즘과 구조체가 모든 언어에서 기본적으로 지원되지 않기 때문에 CCXT는 공식 배포 바이너리를 사용하여 서명 프로세스(FFI/WASM를 통해)를 처리합니다. 따라서 사용하는 언어에 따라 해당 바이너리의 경로를 제공해야 합니다.

### Python/C#/PHP 사용자:

- 바이너리는 여기에서 다운로드할 수 있습니다: https://github.com/elliottech/lighter-python/tree/main/lighter/signers
- 바이너리 경로를 `libraryPath`로 제공해야 합니다
- OS/아키텍처에 맞는 바이너리를 선택해야 합니다

```python
lighter = ccxt.lighter({
	'options': {
		'libraryPath': 'path/to/lighter-signer-linux-arm64.so',
	}
})
```

### Javascript/Typescript 사용자

- CCXT는 공식 패키지에서 빌드된 WASM 바이너리를 사용하며, 여기에서 다운로드하거나 소스에서 빌드할 수 있습니다: https://github.com/ccxt/lighter-wasm
- `exec_wasm.js`의 경로도 제공해야 하며, 동일한 저장소에서 다운로드하거나 로컬 파일 경로를 확인할 수 있습니다 (Go가 설치되어 있다고 가정)

```javascript
lighter = ccxt.lighter({
	'options': {
		'libraryPath': '/user/cjg/Git/lighter-wasm/lighter.wasm',
		'wasmExecPath': '/opt/homebrew/opt/go/libexec/lib/wasm/wasm_exec.js'
	}
})
```

### GO 사용자

- 아무것도 필요하지 않으며, CCXT가 공식 GO 패키지를 사용하므로 자격 증명만 제공하면 됩니다


## CCXT에서 DyDx Exchange를 사용하는 방법은?

DyDx는 CCXT의 일부로 제공되며 다른 CCXT 거래소와 유사하게 작동하지만, 일부 사용자에게는 혼란스러울 수 있는 몇 가지 특이점이 있으며 아래에서 자세히 설명합니다. 기본 자격 증명과 종속성만 설정하면 됩니다.

현재 서명 관련 종속성 요구 사항으로 인해 거래소는 Python과 JavaScript에서만 사용 가능합니다. 필요한 종속성이 이식되면 추가 언어 지원이 도입될 예정입니다.


## 자격 증명 요구 사항

DyDx는 다음 중 하나를 요구합니다:
- `privateKey`: dydx에서 사용되는 l1 개인 키(hex), 또는 옵션에서 l2 니모닉을 설정할 수 있습니다
- `exchange.options`의 `mnemonic`: l2 개인 키를 가져오기 위한 24개 단어로, 웹 UI에서 확인할 수 있습니다

예시

```python
dydx = ccxt.dydx({
	'privateKey': 'XXXXXXX',
})

# or
dydx = ccxt.dydx({
	'options': {
		'mnemonic': 'test test ...',
	}
})
```

### 종속성 요구 사항

DyDx는 Python 사용자를 위해 추가 종속성이 필요합니다. 사용하기 전에 로컬에 pycryptodom을 설치해야 합니다.

```bash
$ pip3 install pycryptodom
```


또한 protobuf도 필요하지만, CCXT의 직접 종속성은 아닙니다. 수동으로 설치해야 합니다:

```
npm install protobufjs // javascript/typescript
pip install "protobuf==5.29.5" // python
```

### 사용법

사용법은 다른 거래소와 대체로 일치하지만 일부 동작은 다릅니다.

예를 들어, 주문을 정상적으로 할 수 있지만 dYdX에서 주문을 취소할 때는 기존의 orderId를 사용하지 않습니다. 대신 dYdX는 다음과 같은 추가 필드를 요구합니다:

- orderId가 아닌 clientOrderId
- orderFlags (시장가 및 비한정 GTT 주문은 0, 한정 GTT 주문은 64, 조건부 주문은 32), ccxt는 기본값으로 64를 사용
- goodTillBlockTimeInSeconds (장기 및 조건부 주문에 필요; CCXT는 기본값으로 30일을 사용)
- subAccountId, ccxt는 기본값으로 0을 사용

CCXT는 가장 일반적인 사용 사례에 합리적인 기본값을 제공하지만, 특정 요구 사항에 따라 이러한 값을 재정의(params 또는 options 사용)해야 할 수 있습니다.

### CCXT에서 GRVT Exchange를 사용하는 방법은?

GRVT는 다른 CCXT DEX와 유사하게 작동하며 지갑의 l1 개인 키만 필요합니다.

GRVT 거래소를 인스턴스화하는 예시:

```
exchange = ccxt.grvt({
	'privateKey': 'XXXXXXX', // the l1 private key (hex)
})
```
참고: 이메일로 가입한 사용자의 경우 지갑은 Privy(GRVT의 임베디드 지갑 솔루션)로 구동됩니다. 개인 키를 내보내려면:

1. https://home.privy.io 로 이동
2. GRVT 가입 시 사용한 동일한 이메일/Google 계정으로 로그인
3. 거기서 개인 키를 내보낼 수 있습니다

*(도움이 필요하면 https://support.privy.io 를 방문하세요)*

CCXT는 GRVT의 빌더이기도 하여 기본적으로 사용자가 CCXT를 통해 사용할 경우 1bps(0.01%)의 추가 수수료가 부과됩니다. 하지만 이 수수료는 완전히 선택 사항이며, options에서 `builderFee: False` 옵션을 제공하여 비활성화할 수 있습니다. 그러나 여러분의 기여는 매우 감사히 여깁니다.

```
exchange.options['builderFee'] = False
```

package base

func TestLanguageSpecific() <-chan interface{} {
	ch := make(chan interface{})
	go func() {
		defer close(ch)
		ch <- nil
	}()
	return ch
}

<?php declare(strict_types=1);

/*
 * This file is part of Evenement.
 *
 * (c) Igor Wiedler <igor@wiedler.ch>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace Evenement;

use InvalidArgumentException;

trait EventEmitterTrait
{
    protected $listeners = [];
    protected $onceListeners = [];

    public function on($event, callable $listener)
    {
        if ($event === null) {
            throw new InvalidArgumentException('event name must not be null');
        }

        if (!isset($this->listeners[$event])) {
            $this->listeners[$event] = [];
        }

        $this->listeners[$event][] = $listener;

        return $this;
    }

    public function once($event, callable $listener)
    {
        if ($event === null) {
            throw new InvalidArgumentException('event name must not be null');
        }

        if (!isset($this->onceListeners[$event])) {
            $this->onceListeners[$event] = [];
        }

        $this->onceListeners[$event][] = $listener;

        return $this;
    }

    public function removeListener($event, callable $listener)
    {
        if ($event === null) {
            throw new InvalidArgumentException('event name must not be null');
        }

        if (isset($this->listeners[$event])) {
            $index = \array_search($listener, $this->listeners[$event], true);
            if (false !== $index) {
                unset($this->listeners[$event][$index]);
                if (\count($this->listeners[$event]) === 0) {
                    unset($this->listeners[$event]);
                }
            }
        }

        if (isset($this->onceListeners[$event])) {
            $index = \array_search($listener, $this->onceListeners[$event], true);
            if (false !== $index) {
                unset($this->onceListeners[$event][$index]);
                if (\count($this->onceListeners[$event]) === 0) {
                    unset($this->onceListeners[$event]);
                }
            }
        }
    }

    public function removeAllListeners($event = null)
    {
        if ($event !== null) {
            unset($this->listeners[$event]);
        } else {
            $this->listeners = [];
        }

        if ($event !== null) {
            unset($this->onceListeners[$event]);
        } else {
            $this->onceListeners = [];
        }
    }

    public function listeners($event = null): array
    {
        if ($event === null) {
            $events = [];
            $eventNames = \array_unique(
                \array_merge(\array_keys($this->listeners), \array_keys($this->onceListeners))
            );
            foreach ($eventNames as $eventName) {
                $events[$eventName] = \array_merge(
                    isset($this->listeners[$eventName]) ? $this->listeners[$eventName] : [],
                    isset($this->onceListeners[$eventName]) ? $this->onceListeners[$eventName] : []
                );
            }
            return $events;
        }

        return \array_merge(
            isset($this->listeners[$event]) ? $this->listeners[$event] : [],
            isset($this->onceListeners[$event]) ? $this->onceListeners[$event] : []
        );
    }

    public function emit($event, array $arguments = [])
    {
        if ($event === null) {
            throw new InvalidArgumentException('event name must not be null');
        }

        if (isset($this->listeners[$event])) {
            foreach ($this->listeners[$event] as $listener) {
                $listener(...$arguments);
            }
        }

        if (isset($this->onceListeners[$event])) {
            $listeners = $this->onceListeners[$event];
            unset($this->onceListeners[$event]);
            foreach ($listeners as $listener) {
                $listener(...$arguments);
            }
        }
    }
}

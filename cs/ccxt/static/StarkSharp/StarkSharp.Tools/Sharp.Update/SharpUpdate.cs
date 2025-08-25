using System;
using System.Collections.Generic;
using System.Timers;

namespace StarkSharp.Tools.SharpUpdate
{

    public class SharpUpdateTask
    {
        public Action Action;
        public float Time, Timer;

        public SharpUpdateTask(Action action, float time)
        {
            Time = time;
            Action = action;
            Timer = time;
        }
    }

    public class SharpUpdate
    {
        private List<SharpUpdateTask> tasks = new List<SharpUpdateTask>();
        private System.Timers.Timer timer;
        private float targetTickRate = 1f / 10f;

        public SharpUpdate()
        {
            timer = new System.Timers.Timer(targetTickRate * 1000);
            timer.Elapsed += OnTimedEvent;
            timer.AutoReset = true;
            timer.Enabled = true;
        }

        public void AddTask(Action action, float time)
        {
            tasks.Add(new SharpUpdateTask(action, time));
        }

        private void OnTimedEvent(object source, ElapsedEventArgs e)
        {
            foreach (SharpUpdateTask task in tasks) HandleTask(task);
        }

        private void HandleTask(SharpUpdateTask task)
        {
            task.Timer -= targetTickRate;
            if (task.Timer > 0) return;
            task.Action.Invoke();
            task.Timer = task.Time;
        }

        public void Start() => timer.Start();

        public void Stop() => timer.Stop();
    }
}
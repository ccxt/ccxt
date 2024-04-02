/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

/*
 * This package is based on the work done by Keiron Liddle, Aftex Software
 * <keiron@aftexsw.com> to whom the Ant project is very grateful for his
 * great code.
 */

using System;

namespace Org.BouncyCastle.Bzip2
{
    /**
    * Base class for both the compress and decompress classes.
    * Holds common arrays, and static data.
    *
    * @author <a href="mailto:keiron@aftexsw.com">Keiron Liddle</a>
    */
    public class BZip2Constants
    {
        public const int baseBlockSize = 100000;
        public const int MAX_ALPHA_SIZE = 258;
        public const int MAX_CODE_LEN = 20;
        public const int MAX_CODE_LEN_GEN = 17;
        public const int RUNA = 0;
        public const int RUNB = 1;
        public const int N_GROUPS = 6;
        public const int G_SIZE = 50;
        public const int N_ITERS = 4;
        public const int MAX_SELECTORS = 2 + (900000 / G_SIZE);
        public const int NUM_OVERSHOOT_BYTES = 20;
    }
}

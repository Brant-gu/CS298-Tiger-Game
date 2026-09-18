window.DASHBOARD_DATA = {
  "default_accuracy": 0.85,
  "default_horizon": 2,
  "belief_left": 0.5,
  "available_accuracies": [
    0.85
  ],
  "available_horizons": [
    1,
    2,
    3,
    4,
    5,
    6
  ],
  "runs": [
    {
      "run_id": "p085-h1-exact",
      "parameters": {
        "accuracy": 0.85,
        "horizon": 1,
        "discount": 1.0,
        "reward_preset": "paper_standard",
        "solver_mode": "exact_alpha"
      },
      "metrics": {
        "horizon": 1,
        "accuracy": 0.85,
        "discount": 1.0,
        "raw_alpha_count": 3,
        "deduplicated_alpha_count": 3,
        "pruned_alpha_count": 3,
        "distinct_value_lines": 3,
        "segments": 3,
        "runtime_ms": 0.15189999976428226,
        "value_at_belief": -1.0,
        "best_actions_at_belief": [
          "listen"
        ],
        "q_values_at_belief": {
          "open_left": -45.0,
          "open_right": -45.0,
          "listen": -1.0
        }
      },
      "validation": {
        "status": "paper_match",
        "notes": "Finite-horizon policy structure matches the original Tiger Game papers."
      },
      "reproducibility": {
        "git_commit": "48c8386d121ead674109de964b20aa71454a2110",
        "python_version": "3.14.3",
        "seed": null
      },
      "alpha_vectors": [
        {
          "action": "open_left",
          "values": [
            -100.0,
            10.0
          ]
        },
        {
          "action": "open_right",
          "values": [
            10.0,
            -100.0
          ]
        },
        {
          "action": "listen",
          "values": [
            -1.0,
            -1.0
          ]
        }
      ]
    },
    {
      "run_id": "p085-h2-exact",
      "parameters": {
        "accuracy": 0.85,
        "horizon": 2,
        "discount": 1.0,
        "reward_preset": "paper_standard",
        "solver_mode": "exact_alpha"
      },
      "metrics": {
        "horizon": 2,
        "accuracy": 0.85,
        "discount": 1.0,
        "raw_alpha_count": 27,
        "deduplicated_alpha_count": 15,
        "pruned_alpha_count": 7,
        "distinct_value_lines": 5,
        "segments": 5,
        "runtime_ms": 0.6233999993128236,
        "value_at_belief": -2.0,
        "best_actions_at_belief": [
          "listen"
        ],
        "q_values_at_belief": {
          "open_left": -46.0,
          "open_right": -46.0,
          "listen": -2.0
        }
      },
      "validation": {
        "status": "paper_match",
        "notes": "Finite-horizon policy structure matches the original Tiger Game papers."
      },
      "reproducibility": {
        "git_commit": "48c8386d121ead674109de964b20aa71454a2110",
        "python_version": "3.14.3",
        "seed": null
      },
      "alpha_vectors": [
        {
          "action": "open_left",
          "values": [
            -101.0,
            9.0
          ]
        },
        {
          "action": "open_right",
          "values": [
            9.0,
            -101.0
          ]
        },
        {
          "action": "listen",
          "values": [
            -101.0,
            9.0
          ]
        },
        {
          "action": "listen",
          "values": [
            9.0,
            -101.0
          ]
        },
        {
          "action": "listen",
          "values": [
            7.35,
            -16.85
          ]
        },
        {
          "action": "listen",
          "values": [
            -16.85,
            7.35
          ]
        },
        {
          "action": "listen",
          "values": [
            -2.0,
            -2.0
          ]
        }
      ]
    },
    {
      "run_id": "p085-h3-exact",
      "parameters": {
        "accuracy": 0.85,
        "horizon": 3,
        "discount": 1.0,
        "reward_preset": "paper_standard",
        "solver_mode": "exact_alpha"
      },
      "metrics": {
        "horizon": 3,
        "accuracy": 0.85,
        "discount": 1.0,
        "raw_alpha_count": 147,
        "deduplicated_alpha_count": 35,
        "pruned_alpha_count": 11,
        "distinct_value_lines": 9,
        "segments": 7,
        "runtime_ms": 5.93980000121519,
        "value_at_belief": 2.719999999999999,
        "best_actions_at_belief": [
          "listen"
        ],
        "q_values_at_belief": {
          "open_left": -47.0,
          "open_right": -47.0,
          "listen": 2.719999999999999
        }
      },
      "validation": {
        "status": "paper_match",
        "notes": "Finite-horizon policy structure matches the original Tiger Game papers."
      },
      "reproducibility": {
        "git_commit": "48c8386d121ead674109de964b20aa71454a2110",
        "python_version": "3.14.3",
        "seed": null
      },
      "alpha_vectors": [
        {
          "action": "open_left",
          "values": [
            -102.0,
            8.0
          ]
        },
        {
          "action": "open_right",
          "values": [
            8.0,
            -102.0
          ]
        },
        {
          "action": "listen",
          "values": [
            -102.0,
            8.0
          ]
        },
        {
          "action": "listen",
          "values": [
            8.0,
            -102.0
          ]
        },
        {
          "action": "listen",
          "values": [
            7.7524999999999995,
            -30.472500000000004
          ]
        },
        {
          "action": "listen",
          "values": [
            6.35,
            -17.85
          ]
        },
        {
          "action": "listen",
          "values": [
            2.719999999999999,
            2.719999999999999
          ]
        },
        {
          "action": "listen",
          "values": [
            4.9475,
            -5.227500000000001
          ]
        },
        {
          "action": "listen",
          "values": [
            -30.472500000000004,
            7.7524999999999995
          ]
        },
        {
          "action": "listen",
          "values": [
            -17.85,
            6.35
          ]
        },
        {
          "action": "listen",
          "values": [
            -5.227500000000001,
            4.9475
          ]
        }
      ]
    },
    {
      "run_id": "p085-h4-exact",
      "parameters": {
        "accuracy": 0.85,
        "horizon": 4,
        "discount": 1.0,
        "reward_preset": "paper_standard",
        "solver_mode": "exact_alpha"
      },
      "metrics": {
        "horizon": 4,
        "accuracy": 0.85,
        "discount": 1.0,
        "raw_alpha_count": 363,
        "deduplicated_alpha_count": 100,
        "pruned_alpha_count": 9,
        "distinct_value_lines": 9,
        "segments": 6,
        "runtime_ms": 104.36640000079933,
        "value_at_belief": 2.4212499999999997,
        "best_actions_at_belief": [
          "listen"
        ],
        "q_values_at_belief": {
          "open_left": -42.28,
          "open_right": -42.28,
          "listen": 2.4212499999999997
        }
      },
      "validation": {
        "status": "paper_match",
        "notes": "Finite-horizon policy structure matches the original Tiger Game papers."
      },
      "reproducibility": {
        "git_commit": "48c8386d121ead674109de964b20aa71454a2110",
        "python_version": "3.14.3",
        "seed": null
      },
      "alpha_vectors": [
        {
          "action": "open_left",
          "values": [
            -97.28,
            12.719999999999999
          ]
        },
        {
          "action": "open_right",
          "values": [
            12.719999999999999,
            -97.28
          ]
        },
        {
          "action": "listen",
          "values": [
            5.997624999999999,
            -3.258875000000002
          ]
        },
        {
          "action": "listen",
          "values": [
            4.805499999999999,
            -1.3655000000000008
          ]
        },
        {
          "action": "listen",
          "values": [
            3.6133749999999996,
            0.5278749999999994
          ]
        },
        {
          "action": "listen",
          "values": [
            -3.258875000000002,
            5.997624999999999
          ]
        },
        {
          "action": "listen",
          "values": [
            -1.3655000000000017,
            4.805499999999999
          ]
        },
        {
          "action": "listen",
          "values": [
            0.5278749999999985,
            3.6133749999999996
          ]
        },
        {
          "action": "listen",
          "values": [
            2.4212499999999997,
            2.4212499999999997
          ]
        }
      ]
    },
    {
      "run_id": "p085-h5-exact",
      "parameters": {
        "accuracy": 0.85,
        "horizon": 5,
        "discount": 1.0,
        "reward_preset": "paper_standard",
        "solver_mode": "exact_alpha"
      },
      "metrics": {
        "horizon": 5,
        "accuracy": 0.85,
        "discount": 1.0,
        "raw_alpha_count": 243,
        "deduplicated_alpha_count": 105,
        "pruned_alpha_count": 17,
        "distinct_value_lines": 17,
        "segments": 15,
        "runtime_ms": 203.40570000007574,
        "value_at_belief": 3.6091499999999987,
        "best_actions_at_belief": [
          "listen"
        ],
        "q_values_at_belief": {
          "open_left": -42.57875000000001,
          "open_right": -42.57875000000001,
          "listen": 3.6091499999999987
        }
      },
      "validation": {
        "status": "exploratory",
        "notes": "Result is generated by the exact solver but is not a directly published benchmark."
      },
      "reproducibility": {
        "git_commit": "48c8386d121ead674109de964b20aa71454a2110",
        "python_version": "3.14.3",
        "seed": null
      },
      "alpha_vectors": [
        {
          "action": "open_left",
          "values": [
            -97.57875000000001,
            12.42125
          ]
        },
        {
          "action": "open_right",
          "values": [
            12.42125,
            -97.57875000000001
          ]
        },
        {
          "action": "listen",
          "values": [
            10.71164375,
            -18.362043750000005
          ]
        },
        {
          "action": "listen",
          "values": [
            10.532824999999999,
            -16.752675000000004
          ]
        },
        {
          "action": "listen",
          "values": [
            10.35400625,
            -15.143306250000002
          ]
        },
        {
          "action": "listen",
          "values": [
            9.323168749999999,
            -10.494018750000002
          ]
        },
        {
          "action": "listen",
          "values": [
            9.607175,
            -11.507325000000002
          ]
        },
        {
          "action": "listen",
          "values": [
            9.891181249999999,
            -12.520631250000003
          ]
        },
        {
          "action": "listen",
          "values": [
            10.1751875,
            -13.533937500000002
          ]
        },
        {
          "action": "listen",
          "values": [
            -10.494018750000002,
            9.323168749999999
          ]
        },
        {
          "action": "listen",
          "values": [
            3.6091499999999987,
            3.6091499999999987
          ]
        },
        {
          "action": "listen",
          "values": [
            -11.507325000000002,
            9.607175
          ]
        },
        {
          "action": "listen",
          "values": [
            -12.520631250000003,
            9.891181249999999
          ]
        },
        {
          "action": "listen",
          "values": [
            -18.362043750000005,
            10.71164375
          ]
        },
        {
          "action": "listen",
          "values": [
            -16.752675000000004,
            10.532824999999999
          ]
        },
        {
          "action": "listen",
          "values": [
            -15.143306250000004,
            10.35400625
          ]
        },
        {
          "action": "listen",
          "values": [
            -13.533937500000002,
            10.1751875
          ]
        }
      ]
    },
    {
      "run_id": "p085-h6-exact",
      "parameters": {
        "accuracy": 0.85,
        "horizon": 6,
        "discount": 1.0,
        "reward_preset": "paper_standard",
        "solver_mode": "exact_alpha"
      },
      "metrics": {
        "horizon": 6,
        "accuracy": 0.85,
        "discount": 1.0,
        "raw_alpha_count": 867,
        "deduplicated_alpha_count": 340,
        "pruned_alpha_count": 27,
        "distinct_value_lines": 27,
        "segments": 17,
        "runtime_ms": 3842.9353999999876,
        "value_at_belief": 5.618818749999998,
        "best_actions_at_belief": [
          "listen"
        ],
        "q_values_at_belief": {
          "open_left": -41.39085,
          "open_right": -41.39085,
          "listen": 5.618818749999998
        }
      },
      "validation": {
        "status": "exploratory",
        "notes": "Result is generated by the exact solver but is not a directly published benchmark."
      },
      "reproducibility": {
        "git_commit": "48c8386d121ead674109de964b20aa71454a2110",
        "python_version": "3.14.3",
        "seed": null
      },
      "alpha_vectors": [
        {
          "action": "open_left",
          "values": [
            -96.39085,
            13.60915
          ]
        },
        {
          "action": "open_right",
          "values": [
            13.60915,
            -96.39085
          ]
        },
        {
          "action": "listen",
          "values": [
            10.9565378125,
            -24.556728437500006
          ]
        },
        {
          "action": "listen",
          "values": [
            10.99913875,
            -25.418038750000008
          ]
        },
        {
          "action": "listen",
          "values": [
            11.0417396875,
            -26.279349062500007
          ]
        },
        {
          "action": "listen",
          "values": [
            11.084340625,
            -27.140659375000006
          ]
        },
        {
          "action": "listen",
          "values": [
            10.099435,
            -12.569035000000007
          ]
        },
        {
          "action": "listen",
          "values": [
            6.530794375,
            4.170386874999997
          ]
        },
        {
          "action": "listen",
          "values": [
            8.6462696875,
            -0.6865290625000027
          ]
        },
        {
          "action": "listen",
          "values": [
            6.3787984375,
            4.411792187499998
          ]
        },
        {
          "action": "listen",
          "values": [
            6.2268025,
            4.653197499999997
          ]
        },
        {
          "action": "listen",
          "values": [
            6.0748065625,
            4.894602812499997
          ]
        },
        {
          "action": "listen",
          "values": [
            5.922810624999998,
            5.136008124999998
          ]
        },
        {
          "action": "listen",
          "values": [
            5.770814687499999,
            5.377413437499998
          ]
        },
        {
          "action": "listen",
          "values": [
            4.170386874999997,
            6.530794375
          ]
        },
        {
          "action": "listen",
          "values": [
            4.411792187499998,
            6.378798437499998
          ]
        },
        {
          "action": "listen",
          "values": [
            4.653197499999997,
            6.226802499999999
          ]
        },
        {
          "action": "listen",
          "values": [
            4.894602812499998,
            6.074806562499998
          ]
        },
        {
          "action": "listen",
          "values": [
            5.136008124999999,
            5.9228106249999986
          ]
        },
        {
          "action": "listen",
          "values": [
            5.377413437499999,
            5.770814687499998
          ]
        },
        {
          "action": "listen",
          "values": [
            5.618818749999998,
            5.618818749999998
          ]
        },
        {
          "action": "listen",
          "values": [
            -24.556728437500006,
            10.9565378125
          ]
        },
        {
          "action": "listen",
          "values": [
            -12.569035000000007,
            10.099435
          ]
        },
        {
          "action": "listen",
          "values": [
            -0.6865290625000027,
            8.6462696875
          ]
        },
        {
          "action": "listen",
          "values": [
            -25.418038750000008,
            10.99913875
          ]
        },
        {
          "action": "listen",
          "values": [
            -26.279349062500007,
            11.0417396875
          ]
        },
        {
          "action": "listen",
          "values": [
            -27.140659375000006,
            11.084340625
          ]
        }
      ]
    }
  ]
};

import { json } from "@sveltejs/kit";

export async function POST(event) {
	const data = await event.request.formData();
	const experimentId = data.get('experimentId')?.toString();

	const { dbConnection } = event.locals;

		try {
			// Get the latest version of the experiment
			const versionQuery = `
				SELECT ev.id as version_id, f.id as flowchart_id
				FROM experiment_versions ev
				JOIN experiments e ON ev.experiment_id = e.id
				JOIN flowcharts f ON ev.id = f.version_id
				WHERE e.id = $1 AND e.user_id = $2
				ORDER BY ev.version_number DESC
				LIMIT 1
			`;
			const versionResult = await dbConnection.query(versionQuery, [experimentId, event.locals.user.id]);

			if (versionResult.rows.length === 0) {
				return ( { message: 'Experiment not found or you do not have access to it.' });
			}

			const flowchartId = versionResult.rows[0].flowchart_id;

			const nodesQuery = `
				SELECT json_agg(
					json_build_object(
					'id', node_id,
					'type', type,
					'position', json_build_object('x', position_x, 'y', position_y),
					'data', data
					)
				)::json as nodes
				FROM flowchart_nodes 
				WHERE flowchart_id = $1
			`;

			const nodesResult = await dbConnection.query(nodesQuery, [flowchartId]);
			const nodes = nodesResult.rows[0].nodes;

			// Load edges
			const edgesQuery = `
				SELECT json_agg(
				json_build_object(
				'id', edge_id,
				'source', source_node_id,
				'target', target_node_id,
				'type', type,
				'data', data
				)
				)::json as edges
				FROM flowchart_edges
				WHERE flowchart_id = $1
			`;
			const edgesResult = await dbConnection.query(edgesQuery, [flowchartId]);
			const edges = edgesResult.rows[0].edges;
			console.log ('Nodes: ', nodes);
			console.log ('Edges: ', edges);
			return json({nodes, edges});
		} catch (error) {
			console.error('Failed to load flowchart:', error);
			return ( { message: 'Could not load the flowchart from the database.' });
		}
}